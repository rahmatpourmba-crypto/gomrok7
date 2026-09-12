# -*- coding: utf-8 -*-
"""
Batch pipeline for the Gomrok customs-broker exam videos.

For each selected question N (from a gomrok question-bank JSON):
  1. writes data file out/qN.json (template + measured audio durations)
  2. generates 7 TTS segments into <remotion>/public/customs/qN_{q,o1..o4,a,r}.mp3
  3. renders <remotion>/out/qN.mp4 via the Remotion CLI (CustomsQuestion comp)
  4. (optional --send) posts the video + caption to the Telegram channel

Cross-platform: works on Windows (local) and Linux (GitHub Actions).
On Actions the render output is sent to Telegram then deleted immediately
so no video file persists. Option labels use Persian letters (الف/ب/ج/د).

Usage:
  python batch_pipeline.py [--range A-B] [--list 1,5,9] [--send] [--dry-run]
                       [--json <bank.json>] [--sec <substring>]
Defaults: all questions that have a correct answer and non-empty options.
"""
import sys, io, os, json, asyncio, subprocess, time, re, argparse, hashlib, platform
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import urllib.request
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
urllib.request.install_opener(opener)

HERE = Path(__file__).resolve().parent
FIN = HERE / "gomrok_bank7.json"
PROJ = HERE / "remotion-video"
REMOTION = Path(os.environ.get("REMOTION_DIR", PROJ))
INDEX_TS = REMOTION / "src" / "index.ts"
CUSTOMS_DIR = REMOTION / "public" / "customs"
OUT = REMOTION / "out"
WORK = REMOTION / "work"

if platform.system() == "Windows":
    CHROME = os.environ.get("CHROME",
                            r"C:\Program Files\Google\Chrome\Application\chrome.exe")
    REMOTION_BIN = REMOTION / "node_modules" / ".bin" / "remotion.cmd"
else:
    CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome-stable")
    REMOTION_BIN = REMOTION / "node_modules" / ".bin" / "remotion"

FPS = 30
VOICE = "fa-IR-FaridNeural"
RATE = "-8%"
SEG_ORDER = ["q", "o1", "o2", "o3", "o4", "a", "r"]
NUMWORDS = {1: "الف", 2: "ب", 3: "ج", 4: "د"}


# Standardise Persian orthography (Arabic letter variants) and keep known
# compound words written with the ZWNJ half-space, so both the on-screen
# caption and the TTS audio read the question/answer correctly ("کالا" etc).
# For TTS phonetics we intentionally do NOT inject Arabic tashkeel here;
# if a specific word is ever mispronounced, fix it word-by-word in PRONOUNCE.
FA_CLEAN = {"ك": "ک", "ي": "ی", "ة": "ه", "ی": "ی"}
COMPOUNDS = {"کالا": "کالا", "کالای": "کالای", "کالاهای": "کالاهای",
             "کالاها": "کالاها", "اقلام": "اقلام"}
PRONOUNCE = {}

FA_REPL = {ord("ك"): "ک", ord("ي"): "ی", ord("ة"): "ه"}


def fa_clean(t):
    if not t:
        return t
    s = str(t).translate(FA_REPL)
    # Common OCR corruption: كاال (ك+ا+ا+ل) instead of كالا (ك+ا+ل+ا).
    # Fix so the word is both spelled and pronounced correctly ("کالا").
    s = s.replace("کاال", "کالا")
    return s

OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)
CUSTOMS_DIR.mkdir(parents=True, exist_ok=True)


# Questions whose prompt is an incomplete OCR body-bleed (cut-off text).
# These produce broken "question" and cross-contaminated reasons, so skip.
BROKEN_QS = {2, 5, 7, 8, 12, 34, 51, 53, 62, 192, 202, 257, 258, 259, 260, 261}


def load_questions(fin_path, selected, sec_sel=None):
    """Read a question bank JSON in either schema.

    - Legacy gomrok_final.json:  { "<num>": {num, question, options, correct, reason} }
    - New gomrok_bank7.json:      {"mcq": [{num, sec, maddeh, question, options, correct, reason}],
                                   "qa":  [{num, sec, question, answer}]}
    BROKEN_QS / legacy filters apply only to the legacy schema.
    """
    raw = json.loads(Path(fin_path).read_text(encoding="utf-8"))
    if isinstance(raw, dict) and "mcq" in raw:
        items = raw["mcq"]
        is_bank7 = True
    else:
        items = [raw[str(n)] for n in sorted(int(k) for k in raw)]
        is_bank7 = False
    chosen = []
    for q in items:
        if not is_bank7:
            if q["num"] in BROKEN_QS:
                continue
        if q.get("correct") is None:
            continue
        opts = q.get("options") or []
        if len([o for o in opts if o.strip()]) < 4:
            continue
        if selected is not None and q["num"] not in selected:
            continue
        if sec_sel and not any(s in (q.get("sec") or "") for s in sec_sel):
            continue
        chosen.append(q)
    return chosen


def build_segments(q):
    segs = {}
    segs["q"] = fa_clean(f"سوال {q['num']}. {q['question']}")
    for i in range(4):
        segs[f"o{i+1}"] = fa_clean(f"گزینه {NUMWORDS[i + 1]}. {q['options'][i]}")
    segs["a"] = fa_clean(f"پاسخ صحیح، گزینه {NUMWORDS[q['correct']]} است. {q['options'][q['correct'] - 1]}")
    segs["r"] = fa_clean((q.get("reason") or "").strip()) or "طبق مفاد قانون امور گمرکی"
    return segs


def qa_check(q, segs, durs):
    """Return a list of problems found before sending; empty list = OK.

    Checks contain text sanity, option/answer consistency, TTS silence,
    and known OCR artefacts. Non-exhaustive on purpose: the point is to
    catch the common failure modes, not to second-guess every question.
    """
    probs = []
    qtxt = fa_clean(q["question"]).strip() or ""
    if not qtxt:
        probs.append("سوال خالی است")
    for pat, label in [("===PAGE", "اثر OCR صفحه"), ("*", "کاراکتر *"), ("تلها", "تله ا"),
                       ("؟؟", "علامت سوال تکراری"), ("ahdch", "نویسه خارجی")]:
        if pat in qtxt:
            probs.append(f"متن سوال شامل {label!r}")
    if len(re.sub(r"[^\u0600-\u06FF]", "", qtxt)) < 6:
        probs.append("سوال تقریباً بدون حرف فارسی")

    opts = [fa_clean(o).strip() for o in (q.get("options") or [])]
    if len(opts) < 4 or any(not o for o in opts):
        probs.append("گزینه‌های ناقص/خالی")
    _norm = lambda s: re.sub(r"[\s\u200c]+", "", s)
    if len(set(_norm(o) for o in opts if o)) != len([o for o in opts if o]):
        probs.append("گزینه‌های کاملاً تکراری")
    c = q.get("correct")
    if c not in (1, 2, 3, 4) or not opts or c > len(opts):
        probs.append("شماره پاسخ صحیح نامعتبر")
    else:
        fa_len = len(re.findall(r"[\u0600-\u06FF]", opts[c - 1]))
        if fa_len > 0 and fa_len < 2:
            probs.append("پاسخ صحیح تقریباً خالی")
        for i, o in enumerate(opts, 1):
            if i != c and _norm(o) == _norm(opts[c - 1]):
                probs.append(f"گزینه {i} با پاسخ صحیح یکسان است")
    if _norm(segs["a"].replace(f"پاسخ صحیح، گزینه {NUMWORDS[c]} است.", "")) and \
       _norm(opts[c - 1]) not in _norm(segs["a"]):
        probs.append("پاسخ صحیح با متن انطباق ندارد")

    for key in SEG_ORDER:
        d = durs.get(key)
        if d is None or d < 0.8:
            probs.append(f"صدای {key} خاموش/خیلی کوتاه است")
        f = CUSTOMS_DIR / f"q{q['num']}_{key}.mp3"
        if not f.exists() or f.stat().st_size < 2048:
            probs.append(f"فایل صدای {key} موجود نیست")
    return probs


async def gen(text, out, rate):
    import edge_tts
    for attempt in range(8):
        try:
            c = edge_tts.Communicate(text, VOICE, rate=rate)
            await c.save(str(out))
            return
        except Exception as e:
            print(f"  retry {attempt} err {e}", flush=True)
            await asyncio.sleep(5)
    raise RuntimeError(f"TTS failed: {out}")


def mp3_dur(path):
    # Pure-Python MP3 duration (no ffprobe dependency). For the TTS output
    # (near-CBR MPEG-1/2 Layer III) duration = audio_bytes * 8 / bitrate,
    # using the codec from the FIRST valid frame header.
    V1_L3 = {1:32,2:40,3:48,4:56,5:64,6:80,7:96,8:112,9:128,10:160,11:192,12:224,13:256,14:320}
    V2_L3 = {1:8,2:16,3:24,4:32,5:40,6:48,7:56,8:64,9:80,10:96,11:112,12:128,13:144,14:160}
    SRS = {3: [44100, 22050, 11025], 2: [22050, 11025, 8000], 0: [11025, 5500, 4000]}
    try:
        data = open(path, "rb").read()
    except Exception:
        return None
    n = len(data)
    i = 0
    if n >= 10 and data[:3] == b"ID3":
        i = 10 + ((data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9])
    # scan for the first valid frame header
    while i + 4 <= n:
        if data[i] == 0xFF and (data[i + 1] & 0xE0) == 0xE0:
            ver = (data[i + 1] >> 3) & 0x03
            idx = (data[i + 2] >> 4) & 0x0F
            sidx = (data[i + 2] >> 2) & 0x03
            if idx in (0, 15) or sidx == 3 or ver == 1:
                i += 1
                continue
            break
        i += 1
    if i + 4 > n:
        return None
    ver = (data[i + 1] >> 3) & 0x03
    idx = (data[i + 2] >> 4) & 0x0F
    sidx = (data[i + 2] >> 2) & 0x03
    kbps = (V1_L3 if ver == 3 else V2_L3)[idx]
    audio_bytes = n - i
    return round(audio_bytes * 8 / (kbps * 1000.0), 2)


def render(q, out_file):
    # Remotion officially recommends passing props as a JSON file path:
    #   --props=/path/to/props.json   (avoids Windows CLI quote/escape mangling).
    # Write the file as UTF-8 (no BOM) so Persian text loads correctly.
    props_file = WORK / f"props_q{q['num']}.json"
    props_file.write_bytes(json.dumps({"q": q}, ensure_ascii=False, indent=1).encode("utf-8"))
    cmd = [str(REMOTION_BIN), "render", str(INDEX_TS), "CustomsQuestion", str(out_file),
           f"--props={props_file}",
           "--browser-executable", CHROME]
    log = WORK / f"render_q{q['num']}.log"
    for attempt in range(3):
        try:
            with open(log, "w", encoding="utf-8", errors="replace") as fh:
                fh.write(" ".join(str(c) for c in cmd) + "\n")
                rc = subprocess.run(cmd, stdout=fh, stderr=subprocess.STDOUT, timeout=2400,
                                    cwd=str(REMOTION)).returncode
            if rc == 0 and out_file.exists() and out_file.stat().st_size > 0:
                return True
        except Exception as e:
            import traceback
            log.write_text(repr(e) + "\n" + traceback.format_exc(), encoding="utf-8", errors="replace")
        time.sleep(15)
    return False


TOKEN = os.environ.get("TELEGRAM_TOKEN")
CHAT = os.environ.get("TELEGRAM_CHAT")
if not TOKEN or not CHAT:
    sys.exit("TELEGRAM_TOKEN and TELEGRAM_CHAT env vars are required")
API = f"https://api.telegram.org/bot{TOKEN}"
FA_D = "۰۱۲۳۴۵۶۷۸۹"
FA_N = ["الف", "ب", "ج", "د"]


def tofa(n):
    return "".join(FA_D[int(c)] for c in str(n))


def build_caption(q, limit=1000):
    body = fa_clean(q['question'])
    opts = [f"{FA_N[i]}) {fa_clean(opt)}" for i, opt in enumerate(q["options"])]
    ans = f"✅ پاسخ صحیح: گزینه {FA_N[q['correct'] - 1]}"

    # Question + options + correct answer only.
    def make(with_opts, qmax=99999, rmax=99999):
        lines = [body[:qmax].rstrip()] + [""]
        if with_opts:
            lines += opts
        lines += [""] + [ans[:rmax].rstrip()]
        return "\n".join(lines)

    c = make(True)
    if len(c) <= limit:
        return c
    for cut in (700, 400, 200, 100):
        c = make(True, qmax=cut)
        if len(c) <= limit:
            return c
    c = make(False)
    if len(c) <= limit:
        return c
    for rmax in (500, 300, 150, 0):
        c = make(False, rmax=rmax)
        if len(c) <= limit:
            return c
    return make(False, qmax=200, rmax=0)[:limit]


def send_telegram(q, vpath):
    import urllib.request
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    caption = build_caption(q)
    body = b""
    for name, val in [("chat_id", CHAT.encode()), ("caption", caption.encode("utf-8"))]:
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += val + b"\r\n"
    body += f"--{boundary}\r\n".encode()
    body += b'Content-Disposition: form-data; name="video"; filename="vid.mp4"\r\n'
    body += b"Content-Type: video/mp4\r\n\r\n"
    body += Path(vpath).read_bytes() + b"\r\n"
    body += f"--{boundary}--\r\n".encode()

    req = urllib.request.Request(API + "/sendVideo", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read().decode("utf-8", "replace"), caption
        except Exception as e:
            print("  send attempt", attempt, "err", e, flush=True)
            time.sleep(4)
    return "FAILED", caption


def build_batch():
    ap = argparse.ArgumentParser()
    ap.add_argument("--range", type=str)
    ap.add_argument("--list", type=str)
    ap.add_argument("--sec", type=str, help="filter bank-7 sections by name substring")
    ap.add_argument("--json", type=str, default=str(FIN),
                    help="question-bank JSON (legacy dict or {mcq:[...]} schema)")
    ap.add_argument("--send", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    fin = Path(args.json)
    if not fin.exists():
        sys.exit(f"json not found: {fin}")

    sel = None
    if args.range:
        a, b = map(int, args.range.split("-"))
        sel = set(range(a, b + 1))
    elif args.list:
        sel = set(map(int, args.list.split(",")))

    sec_sel = {s.strip() for s in args.sec.split(",")} if args.sec else None
    questions = load_questions(fin, sel, sec_sel)
    print(f"selected {len(questions)} questions from {fin}", flush=True)

    for q in questions:
        n = q["num"]
        data_file = OUT / f"q{n}.json"
        mp4 = OUT / f"q{n}.mp4"
        segs = build_segments(q)

        if not args.dry_run:
            print(f"--- TTS q{n} ---", flush=True)
            durs = {}
            for key in SEG_ORDER:
                out = CUSTOMS_DIR / f"q{n}_{key}.mp3"
                mark = CUSTOMS_DIR / f"q{n}_{key}.txt"
                text_hash = hashlib.md5(segs[key].encode("utf-8")).hexdigest()
                if (not out.exists() or not mark.exists()
                        or mark.read_text(encoding="utf-8") != text_hash or args.send):
                    asyncio.run(gen(segs[key], out, RATE))
                    mark.write_text(text_hash, encoding="utf-8")
                durs[key] = mp3_dur(out) or 1.0
            q["audio"] = durs
        else:
            # dry-run: fake durations so downstream math can be previewed
            q["audio"] = {k: 6.0 for k in SEG_ORDER}

        data_file.write_text(json.dumps(q, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"wrote {data_file.name} audio={q['audio']}", flush=True)

        if args.dry_run:
            continue

        if mp4.exists():
            mp4.unlink()
        print(f"--- render q{n} ---", flush=True)
        ok = render(q, mp4)
        if not ok:
            print(f"RENDER FAILED q{n}", flush=True)
            continue
        print(f"rendered {mp4.name} {mp4.stat().st_size:,} B", flush=True)

        if args.send:
            print(f"--- qa q{n} ---", flush=True)
            probs = qa_check(q, segs, q.get("audio", {}))
            if probs:
                for p in probs:
                    print(f"  QA-FAIL q{n}: {p}", flush=True)
                print(f"  SKIP send q{n}", flush=True)
                continue
            print(f"--- send q{n} ---", flush=True)
            res, caption = send_telegram(q, mp4)
            ok = res != "FAILED" and '"ok":true' in res
            print(f"send {'OK' if ok else 'FAILED'} -> {res[:200]}", flush=True)
            if ok:
                mp4.unlink(missing_ok=True)
                print(f"deleted {mp4.name}", flush=True)


if __name__ == "__main__":
    build_batch()
