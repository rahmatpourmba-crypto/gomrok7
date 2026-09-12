import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import segments from './segments.json';
import {Fonts} from './visuals';

type Seg = (typeof segments)[number];

const RED = '#E63B4A';
const RED_DEEP = '#C22534';
const BLUE = '#2F6CFF';
const BLUE_DEEP = '#1D4FD8';
const GREEN = '#0EA86B';
const GREEN_DEEP = '#0A7F51';
const INK = '#1E2430';
const SOFT = '#6B7280';
const FAINT = '#EDF0F6';
const GOLD_FM = '#FFB319';

export const SEG_OPEN = 45;
export const SEG_END = 100;

/* ── palette (export for PlayerDaily) ── */
export const RED_S = '#E63B4A';
export const RED_DEEP_S = '#C22534';
export const BLUE_S = '#2F6CFF';
export const GREEN_S = '#0EA86B';
export const GREEN_DEEP_S = '#0A7F51';
export const INK_S = '#1E2430';
export const SOFT_S = '#6B7280';
export const FAINT_S = '#EDF0F6';

/* ── helpers (export for PlayerDaily) ── */
export function segFrames(durs: number[], fps: number): number {
  let total = 0;
  for (const d of durs) total += Math.max(6, Math.round(d * fps));
  return total;
}
export function startFrame(durs: number[], i: number, fps: number): number {
  let acc = 0;
  for (let k = 0; k < i && k < durs.length; k++) acc += Math.max(6, Math.round(durs[k] * fps));
  return acc;
}

/* ── richer background (exported) ── */
export const SoftBlobs: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const d1 = Math.sin(frame * 0.02) * 60;
  const d2 = Math.cos(frame * 0.017) * 50;
  const d3 = Math.sin(frame * 0.023 + 2) * 45;
  const breathe = 1 + 0.04 * Math.sin(frame * 0.03);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'linear-gradient(160deg, #FFFFFF 0%, #F4FBF7 40%, #EFF5FF 100%)'}}>
      <div style={{position: 'absolute', width: width * 1.05, height: width * 1.05, left: -width * 0.35 + d1, top: -height * 0.16, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,59,74,0.13) 0%, rgba(230,59,74,0) 70%)', transform: `scale(${breathe})`}} />
      <div style={{position: 'absolute', width: width * 1.05, height: width * 1.05, right: -width * 0.35 + d2, bottom: -height * 0.18, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,108,255,0.13) 0%, rgba(47,108,255,0) 70%)', transform: `scale(${2.2 - breathe})`}} />
      <div style={{position: 'absolute', width: width * 0.7, height: width * 0.7, left: '4%', bottom: '18%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,168,107,0.11) 0%, rgba(14,168,107,0) 70%)', transform: `scale(${breathe * 1.15})`}} />
      <div style={{position: 'absolute', width: width * 0.6, height: width * 0.6, right: '6%', top: '14%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,168,107,0.09) 0%, rgba(14,168,107,0) 70%)', transform: `scale(${2.3 - breathe * 1.15})`}} />
      {/* faint gold accent */}
      <div style={{position: 'absolute', width: width * 0.5, height: width * 0.5, left: '30%', top: '38%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,25,0.08) 0%, rgba(255,179,25,0) 70%)', filter: 'blur(20px)'}} />
      {/* thin top/bottom accent lines: red → green → blue */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, transparent, #E63B4A 25%, #0EA86B 50%, #2F6CFF 75%, transparent)'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, transparent, #2F6CFF 25%, #0EA86B 50%, #E63B4A 75%, transparent)'}} />
    </AbsoluteFill>
  );
};

/* ── floating particles (ornamental) ── */
export const FloatingDots: React.FC<{count?: number}> = ({count = 22}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const rnd = (i: number, salt: number) => {
    const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const dots = [];
  for (let i = 0; i < count; i++) {
    const bx = rnd(i, 1);
    const by = rnd(i, 2);
    const sz = 3 + rnd(i, 3) * 6;
    const driftX = Math.sin(frame * (0.006 + rnd(i, 4) * 0.02) + rnd(i, 5) * 9) * 26;
    const rise = (frame * (8 + rnd(i, 6) * 26)) % height;
    const colors = ['rgba(230,59,74,0.35)', 'rgba(47,108,255,0.35)', 'rgba(14,168,107,0.35)', 'rgba(255,179,25,0.3)'];
    dots.push(
      <div key={i} style={{position: 'absolute', left: `${bx * 100}%`, top: `${(100 - rise / height * 100 + 20 + by * 40) % 100}%`, width: sz, height: sz, borderRadius: '50%', background: colors[i % colors.length], transform: `translateX(${driftX}px)`, }} />
    );
  }
  return <AbsoluteFill style={{overflow: 'hidden'}}>{dots}</AbsoluteFill>;
};

export const BrandPill: React.FC<{size?: number}> = ({size = 17}) => {
  const frame = useCurrentFrame();
  const onAir = Math.sin(frame * 0.28) > 0.4;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(180deg, #FFFFFF, #FBFDFF)', border: '1.5px solid rgba(30,36,48,0.12)', borderRadius: 50, padding: '10px 24px', boxShadow: '0 6px 22px rgba(30,36,48,0.08)'}}>
      <div style={{width: size * 0.6, height: size * 0.6, borderRadius: '50%', background: onAir ? '#FF3B4E' : 'rgba(230,59,74,0.3)', boxShadow: onAir ? '0 0 12px rgba(255,59,78,0.6)' : 'none'}} />
      <span style={{fontFamily: Fonts.fa, fontWeight: 900, fontSize: size, color: INK, letterSpacing: 1}}>
        راديو القرآن <span style={{color: RED}}>QURAN</span> <span style={{color: GREEN}}>FM</span>
      </span>
    </div>
  );
};

/* ── elegant open card ── */
export const OpenCard: React.FC<{
  surahName: string;
  rangeTxt: string;
  bismillah?: string;
}> = ({surahName, rangeTxt, bismillah}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, 34, 45], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const up = interpolate(frame, [0, 32], [0.88, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', opacity, padding: '0 8%'}}>
      {/* decorative ring */}
      <div style={{position: 'absolute', width: 640, height: 640, borderRadius: '50%', border: '3px solid rgba(47,108,255,0.20)', boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: '2px solid rgba(230,59,74,0.18)', boxSizing: 'border-box'}} />

      <BrandPill size={20} />
      <div style={{fontFamily: Fonts.quran, fontSize: 48, color: GREEN, fontWeight: 700, marginTop: 30, opacity: 0.95, textShadow: '0 4px 20px rgba(14,168,107,0.25)'}}>
        {bismillah || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
      </div>
      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 108, color: INK, textAlign: 'center', marginTop: 30, transform: `scale(${up})`, lineHeight: 2, textShadow: '0 8px 40px rgba(30,36,48,0.12)'}}>
        سُورَةُ {surahName}
      </div>
      <div style={{height: 3, width: 180, borderRadius: 2, background: `linear-gradient(90deg, ${RED}, ${GREEN}, ${BLUE})`, margin: '6px 0 20px'}} />
      <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 30, color: SOFT, letterSpacing: 3, textTransform: 'uppercase'}}>
        {rangeTxt}
      </div>
      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 34, color: GREEN_DEEP, marginTop: 24}}>يَاسِر الدُّوسَرِي</div>

      {/* pulsing play hint */}
      <div style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 12}}>
        <div style={{position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {[0, 1, 2].map((i) => {
            const ph = ((frame + i * 9) % 27) / 27;
            return (
              <div key={i} style={{position: 'absolute', width: 56, height: 56, borderRadius: '50%', border: `2px solid rgba(230,59,74,${0.5 * (1 - ph)})`, transform: `scale(${1 + ph * 1.7})`, opacity: 1 - ph, boxSizing: 'border-box'}} />
            );
          })}
          <div style={{width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(135deg, #FF5A68, ${RED} 60%, ${RED_DEEP})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(230,59,74,0.35)'}}>
            <div style={{width: 0, height: 0, marginLeft: 4, borderLeft: '16px solid #FFF', borderTop: '10px solid transparent', borderBottom: '10px solid transparent'}} />
          </div>
        </div>
        <span style={{fontFamily: 'Vazirmatn', fontWeight: 700, fontSize: 22, color: SOFT, letterSpacing: 1}}>تَبْدَأُ التِّلَاوَةُ</span>
      </div>
    </AbsoluteFill>
  );
};

/* ── animated equalizer bars ── */
export const Equalizer: React.FC<{barCount?: number; colorA?: string; colorB?: string}> = ({barCount = 5, colorA = RED, colorB = GREEN}) => {
  const frame = useCurrentFrame();
  const heights = [];
  for (let i = 0; i < barCount; i++) {
    const h = 10 + Math.abs(Math.sin(frame * 0.3 + i * 0.9)) * 26;
    heights.push(h);
  }
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 3, height: 34}}>
      {heights.map((h, i) => (
        <div key={i} style={{width: 5, borderRadius: 3, height: h, background: i % 2 === 0 ? colorA : colorB, boxShadow: `0 2px 8px ${i % 2 === 0 ? 'rgba(230,59,74,0.35)' : 'rgba(14,168,107,0.35)'}`}} />
      ))}
    </div>
  );
};

/* ── expressive end card ── */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [12, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + 0.05 * Math.sin((2 * Math.PI * frame) / 26);
  const bounce = 1 + 0.08 * Math.sin((2 * Math.PI * frame) / 20);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, flexDirection: 'column', padding: '0 8%'}}>
      <div style={{position: 'absolute', width: 600, height: 600, borderRadius: '50%', border: '3px solid rgba(14,168,107,0.18)', boxSizing: 'border-box'}} />
      <div style={{width: 110, height: 5, borderRadius: 3, background: `linear-gradient(90deg, ${RED}, ${GREEN}, ${BLUE})`, marginBottom: 40, transform: `scaleX(${bounce})`}} />
      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 74, color: INK, textAlign: 'center', lineHeight: 1.8, direction: 'rtl', textShadow: '0 8px 36px rgba(30,36,48,0.08)'}}>
        آيةُ آرَام — راديو القرآن
      </div>
      <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 28, color: SOFT, letterSpacing: 3, textTransform: 'uppercase', marginTop: 10}}>
        You Tube — Stay Tuned
      </div>
      <div style={{height: 3, width: 160, borderRadius: 2, background: `linear-gradient(90deg, ${GREEN}, ${BLUE}, ${RED})`, margin: '28px 0 30px'}} />
      <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 900, fontSize: 46, color: GREEN_DEEP, transform: `scale(${pulse})`, letterSpacing: 1}}>
        @islamrazekhoshabkhte
      </div>
      <div style={{display: 'flex', flexDirection: 'row', gap: 26, justifyContent: 'center', marginTop: 42}}>
        <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 900, fontSize: 28, color: '#FFFFFF', background: `linear-gradient(135deg, #FF5A68, ${RED})`, padding: '16px 38px', borderRadius: 46, boxShadow: '0 12px 34px rgba(230,59,74,0.4)'}}>👍 Like</div>
        <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 900, fontSize: 28, color: '#FFFFFF', background: `linear-gradient(135deg, #3DDC97, ${GREEN_DEEP})`, padding: '16px 38px', borderRadius: 46, boxShadow: '0 12px 34px rgba(14,168,107,0.4)'}}>🔔 Subscribe</div>
      </div>
    </AbsoluteFill>
  );
};

/* ── progress dots with count ── */
export const FlowBar: React.FC<{idx: number; total: number}> = ({idx, total}) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center'}}>
        {Array.from({length: total}, (_, i) => (
          <div key={i} style={{width: i === idx ? 16 : 9, height: i === idx ? 16 : 9, borderRadius: '50%', background: i < idx ? RED : i === idx ? BLUE : FAINT, boxShadow: i === idx ? '0 0 12px rgba(47,108,255,0.5)' : 'none', transition: 'all 0.1s'}} />
        ))}
      </div>
      <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 700, fontSize: 17, color: SOFT}}>
        {idx + 1} <span style={{opacity: 0.5}}>/ {total}</span>
      </div>
    </div>
  );
};

/* ── large, elegant ayah view ── */
export const AyahView: React.FC<{
  surahName: string;
  surahEn: string;
  ayahNum: number;
  arabicText: string;
  enText: string;
  durSec: number;
  localFrame: number;
  showBasmala?: boolean;
}> = ({surahName, surahEn, ayahNum, arabicText, enText, durSec, localFrame, showBasmala}) => {
  const words = (arabicText || '').split(/\s+/).filter(Boolean);
  const wordCount = Math.max(words.length, 1);
  const wordFrames = Math.max(3, (durSec * 30) / wordCount);
  const activeIdx = Math.min(wordCount - 1, Math.floor(localFrame / wordFrames));
  const progress = durSec > 0 ? Math.min(1, localFrame / (durSec * 30)) : 0;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const sceneIn = interpolate(localFrame, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scaleIn = interpolate(localFrame, [0, 20], [0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const playPulse = 1 + 0.06 * Math.sin((2 * Math.PI * localFrame) / 22);

  return (
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 0 120px', opacity: sceneIn, transform: `scale(${scaleIn})`}}>
      <BrandPill size={18} />

      {/* surah + ayah num, big */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 22, marginBottom: 12, gap: 4}}>
        <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 52, color: INK, textShadow: '0 4px 18px rgba(30,36,48,0.10)'}}>
          سُورَةُ {surahName}
        </div>
        <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 24, color: GREEN_DEEP, letterSpacing: 3, textTransform: 'uppercase', background: 'rgba(14,168,107,0.10)', padding: '4px 18px', borderRadius: 20}}>
          {surahEn} · Ayah {ayahNum}
        </div>
      </div>

      {/* big arabic */}
      <div style={{maxWidth: '94%', textAlign: 'center', fontFamily: Fonts.quran, fontSize: 66, lineHeight: 1.85, color: INK, direction: 'rtl', background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))', borderRadius: 30, padding: '28px 26px', marginBottom: 14, boxShadow: '0 12px 44px rgba(30,36,48,0.10), inset 0 0 0 1px rgba(30,36,48,0.04)', border: '1px solid rgba(14,168,107,0.10)'}}>
        {words.map((w, i) => {
          const on = i === activeIdx;
          const pop = on ? 1 + 0.05 * Math.max(0, 1 - (localFrame - activeIdx * wordFrames) / 6) : 1;
          return (
            <span key={i} style={{
              display: 'inline-block',
              color: on ? '#FFFFFF' : '#2A2F3A',
              background: on ? `linear-gradient(180deg, ${RED}, ${RED_DEEP})` : 'transparent',
              borderRadius: on ? 10 : 0,
              padding: on ? '0 6px' : 0,
              margin: on ? '0 -2px' : 0,
              boxShadow: on ? '0 4px 18px rgba(230,59,74,0.45)' : 'none',
              whiteSpace: 'pre',
              transform: `scale(${pop})`,
              transition: 'all 0.05s',
            }}>
              {w}{' '}
            </span>
          );
        })}
      </div>

      {/* english translation */}
      <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 500, fontSize: 25, color: '#3A4150', fontStyle: 'italic', maxWidth: '88%', textAlign: 'center', lineHeight: 1.6, background: 'rgba(255,255,255,0.72)', borderRadius: 20, padding: '14px 26px', marginBottom: 16, border: '1px solid rgba(14,168,107,0.14)'}}>
        {showBasmala && (
          <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 27, color: GREEN_DEEP, direction: 'rtl', marginBottom: 6, textShadow: '0 2px 10px rgba(14,168,107,0.15)'}}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}
        &ldquo;{enText}&rdquo;
      </div>

      {/* larger player */}
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(255,255,255,0.92)', borderRadius: 60, padding: '14px 30px', boxShadow: '0 14px 44px rgba(30,36,48,0.14), inset 0 0 0 1px rgba(30,36,48,0.04)'}}>
        <div style={{width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, #FF5A68 0%, ${RED} 55%, ${RED_DEEP} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px rgba(230,59,74,0.4)', transform: `scale(${playPulse})`}}>
          <div style={{width: 0, height: 0, marginLeft: 5, borderLeft: '18px solid #FFF', borderTop: '11px solid transparent', borderBottom: '11px solid transparent'}} />
        </div>
        <Equalizer colorA={RED} colorB={GREEN} />
        <div style={{width: 210, height: 8, borderRadius: 5, background: FAINT, overflow: 'hidden'}}>
          <div style={{height: 8, width: `${progress * 100}%`, borderRadius: 5, background: `linear-gradient(90deg, ${RED}, ${GREEN}, ${BLUE})`}} />
        </div>
        <div style={{fontFamily: 'Vazirmatn', fontSize: 20, color: INK, fontWeight: 800, minWidth: 118, textAlign: 'center'}}>
          {fmt(progress * durSec)} / {fmt(durSec)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ── main ── */
export const PlayerSegment: React.FC<{seg: number; durations: number[]}> = ({seg, durations}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = (segments as Seg[])[seg];
  const codes = s.ayahs;
  const durs = durations && durations.length === codes.length ? durations : codes.map(() => 8);

  const bodyFrames = segFrames(durs, fps);
  const totalBody = SEG_OPEN + bodyFrames;
  const endFrom = totalBody;

  const bodyFrame = Math.max(0, frame - SEG_OPEN);
  let ayahIdx = 0;
  for (let i = 0; i < codes.length; i++) {
    const f = Math.max(6, Math.round(durs[i] * fps));
    if (bodyFrame >= f) ayahIdx = i + 1;
    else break;
  }
  ayahIdx = Math.min(ayahIdx, codes.length - 1);
  const localFrame = bodyFrame - startFrame(durs, ayahIdx, fps);

  const bodyOpacity = interpolate(frame, [SEG_OPEN, SEG_OPEN + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const isShort = codes.filter((c, i) => durs[i] > 0).length === 1;

  return (
    <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
      <Sequence from={0} durationInFrames={totalBody} name="bg">
        <SoftBlobs />
        <FloatingDots count={26} />
      </Sequence>

      <Sequence from={0} durationInFrames={SEG_OPEN} name="open">
        <OpenCard
          surahName={s.surah_name}
          rangeTxt={s.from === s.to ? `${s.surah_en} · ${s.from}` : `${s.surah_en} · ${s.from}-${s.to}`}
        />
      </Sequence>

      <Sequence from={SEG_OPEN} durationInFrames={bodyFrames} name="body">
        <AbsoluteFill style={{opacity: bodyOpacity}}>
          {codes.map((code, i) => {
            const start = startFrame(durs, i, fps);
            const len = Math.max(6, Math.round(durs[i] * fps));
            return (
              <Sequence key={code} from={start} durationInFrames={len}>
                <AyahView
                  surahName={s.surah_name}
                  surahEn={s.surah_en}
                  ayahNum={s.from + i}
                  arabicText={s.arabic_ayahs[i] || ''}
                  enText={s.en_ayahs[i] || ''}
                  durSec={durs[i]}
                  localFrame={frame - SEG_OPEN - start}
                  showBasmala={s.from + i === 1}
                />
              </Sequence>
            );
          })}
        </AbsoluteFill>
        {!isShort && (
          <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40}}>
            <FlowBar idx={ayahIdx} total={codes.length} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence from={endFrom} durationInFrames={SEG_END} name="end">
        <EndCard />
      </Sequence>

      {codes.map((code, i) => {
        const start = SEG_OPEN + startFrame(durs, i, fps);
        const len = Math.max(6, Math.round(durs[i] * fps));
        return (
          <Sequence key={code + '_a'} from={start} durationInFrames={len}>
            <Audio src={staticFile(`tilawat/seg_${code}.mp3`)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export function segmentTotalFrames(durs: number[], fps: number): number {
  return SEG_OPEN + segFrames(durs, fps) + SEG_END;
}