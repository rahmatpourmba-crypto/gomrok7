# گمرک ۷ — ارسال خودکار ویدیوهای سوال‌ها به تلگرام

پایپ‌لاین خودکار ساخت ویدیو از بانک سوالات گمرک (2946 سوال چهارگزینه‌ای) و ارسال به کانال تلگرام، اجرا روی **GitHub Actions** — بدون نیاز به کامپیوتر شخصی.

## گردش کار

1. `gomrok_bank7.json` — بانک سوالات (MCQ + تشریحی)
2. `clean_nums.json` — فهرست 2843 سوال سالم (بررسی خودکار محتوا/گزینه‌ها)
3. هر job: **TTS (دستگاه edge-tts)** → **رندر Remotion** (`CustomsQuestion`) → **ارسال به تلگرام** → حذف فوری mp4

## راه‌اندازی

1. در ریپو: **Settings → Secrets and variables → Actions** بسازید:
   - `TELEGRAM_TOKEN` — توکن ربات
   - `TELEGRAM_CHAT` — شناسه کانال/گروه (مثلاً `-100...`)
2. در تب **Actions**، workflow **"Send Gomrok Bank7 to Telegram"** را run کنید.
   - `chunk_size`: تعداد سوال در هر job (پیش‌فرض 10)
   - `max_parallel`: حداکثر job هم‌زمان (پیش‌فرض 20)

## اجرای محلی (اختیاری)

```bash
npx remotion render ...   # رندر
python batch_pipeline.py --range 1-3 --dry-run   # تست بدون ارسال
python batch_pipeline.py --list 1,5,9 --send     # ارسال گروهی
```

نیازمندی‌های متغیر محیطی (برای اجرا/تست): `TELEGRAM_TOKEN`, `TELEGRAM_CHAT`.

## امنیت

- توکن فقط در Secrets ذخیره می‌شود؛ در کد هیچ‌جا رمزی نیست.
- ویدیو روی runner ساخته و بلافاصله بعد از ارسال موفق حذف می‌شود.