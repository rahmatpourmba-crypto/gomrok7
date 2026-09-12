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
import {
  audioForIndex,
  ayahs,
  cleanArabic,
  enOf,
  wordsOf,
  wordTimings,
  activeWordIndex,
} from './data';
import {Fonts} from './visuals';

/* ── palette (Quran FM style: white bg, red + blue player) ── */
const RED = '#E63B4A';
const RED_DEEP = '#C22534';
const BLUE = '#2F6CFF';
const INK = '#1E2430';
const SOFT = '#6B7280';
const FAINT = '#E9ECF2';

/* ── timing ── */
export const OPEN_DUR = 40;
export const END_DUR = 90;
const BAR_COUNT = 44;
const PARTICLE_COUNT = 14;

/* ── english surah names (only surahs present in dataset) ── */
const SURAH_EN: Record<number, string> = {
  2: 'Al-Baqarah', 3: 'Aal Imran', 4: 'An-Nisa', 6: "Al-An'am", 8: 'Al-Anfal',
  9: 'At-Tawbah', 11: 'Hud', 13: "Ar-Ra'd", 17: 'Al-Isra', 18: 'Al-Kahf',
  20: 'Taha', 21: 'Al-Anbiya', 27: 'An-Naml', 29: 'Al-Ankabut', 32: 'As-Sajdah',
  34: 'Saba', 39: 'Az-Zumar', 40: 'Ghafir', 48: 'Al-Fath', 53: 'An-Najm',
  55: 'Ar-Rahman', 57: 'Al-Hadid', 62: "Al-Jumu'ah", 65: 'At-Talaq', 67: 'Al-Mulk',
  89: 'Al-Fajr', 93: 'Ad-Duha', 94: 'Ash-Sharh', 103: 'Al-Asr', 112: 'Al-Ikhlas',
  113: 'Al-Falaq',
};

/* ── deterministic pseudo-random ── */
function seeded(seed: number) {
  let s = seed + 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── soft animated light blobs ── */
const SoftBlobs: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const drift = Math.sin(frame * 0.02) * 40;
  const breathe = 1 + 0.03 * Math.sin(frame * 0.03);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: 'linear-gradient(180deg, #FFFFFF 0%, #FDF3F4 45%, #F0F6FF 100%)'}}>
      <div style={{position: 'absolute', width: width * 0.9, height: width * 0.9, left: -width * 0.3 + drift, top: -height * 0.12, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,59,74,0.11) 0%, rgba(230,59,74,0) 70%)', filter: 'blur(20px)', transform: `scale(${breathe})`}} />
      <div style={{position: 'absolute', width: width * 0.9, height: width * 0.9, right: -width * 0.3 - drift, bottom: -height * 0.15, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,108,255,0.11) 0%, rgba(47,108,255,0) 70%)', filter: 'blur(20px)', transform: `scale(${2 - breathe})`}} />
    </AbsoluteFill>
  );
};

/* ── floating tinted dots ── */
const FloatingDots: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const rng = seeded(7);
  const dots = Array.from({length: PARTICLE_COUNT}, (_, i) => {
    const x = rng() * width;
    const baseY = rng() * height;
    const sz = 3 + rng() * 6;
    const speed = 0.06 + rng() * 0.2;
    const phase = rng() * Math.PI * 2;
    const y = (baseY - frame * speed) % height;
    const osc = Math.sin(phase + frame * 0.025) * 22;
    const red = i % 2 === 0;
    const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.3, 0.3, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <div key={i} style={{position: 'absolute', left: x + osc, top: y < 0 ? y + height : y, width: sz, height: sz, borderRadius: '50%', background: red ? `rgba(230,59,74,${opacity * 0.5})` : `rgba(47,108,255,${opacity * 0.5})`, border: red ? '1px solid rgba(230,59,74,0.5)' : '1px solid rgba(47,108,255,0.5)'}} />
    );
  });
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{dots}</AbsoluteFill>;
};

/* ── waveform (red active / gray inactive) ── */
const WaveformBars: React.FC<{progress: number}> = ({progress}) => {
  const frame = useCurrentFrame();
  const rng = seeded(99);
  const bars = Array.from({length: BAR_COUNT}, (_, i) => {
    const seed = rng();
    const freq = 1.5 + seed * 3;
    const phase = rng() * Math.PI * 2;
    const isActive = i / BAR_COUNT <= progress;
    const h = isActive ? interpolate(Math.sin(phase + frame * freq * 0.08), [-1, 1], [12, 52 + seed * 26]) : 10;
    return (
      <div key={i} style={{width: 4, height: h, borderRadius: 2, background: isActive ? RED : FAINT, transition: 'height 0.05s'}} />
    );
  });
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: 78, width: '100%'}}>
      {bars}
    </div>
  );
};

/* ── circular progress (red track) ── */
const CircleProgress: React.FC<{progress: number}> = ({progress}) => {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle cx={60} cy={60} r={r} fill="none" stroke={FAINT} strokeWidth={6} />
      <circle cx={60} cy={60} r={r} fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 60 60)" />
      <text x={60} y={65} textAnchor="middle" fill={INK} fontSize={18} fontFamily="Vazirmatn, sans-serif" fontWeight={800}>
        {Math.floor(progress * 100)}
      </text>
    </svg>
  );
};

/* ── animated play button (red, blue halo) ── */
const PlayButton: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.045 * Math.sin(frame * 0.14);
  const blueGlow = interpolate(Math.sin(frame * 0.09), [-1, 1], [0.5, 1]);
  const ringGap = (frame % 55) * (46 / 55);
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
      <div style={{position: 'absolute', width: 44 + ringGap * 2, height: 44 + ringGap * 2, borderRadius: '50%', border: `2px solid rgba(47,108,255,${0.5 * (1 - ringGap / 46)})`, boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, rgba(47,108,255,${0.22 * blueGlow}) 0%, rgba(47,108,255,0) 70%)`}} />
      <div style={{width: 112, height: 112, borderRadius: '50%', background: `linear-gradient(135deg, #FF5A68 0%, ${RED} 55%, ${RED_DEEP} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pulse})`, boxShadow: `0 10px 34px rgba(230,59,74,0.42), 0 0 0 6px rgba(47,108,255,0.10)`}}>
        <div style={{width: 0, height: 0, marginLeft: 8, borderLeft: '30px solid #FFFFFF', borderTop: '19px solid transparent', borderBottom: '19px solid transparent', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.18))'}} />
      </div>
    </div>
  );
};

/* ── player card (EN/AR UI) ── */
const PlayerCard: React.FC<{progress: number; durationSec: number}> = ({progress, durationSec}) => {
  const eqFrame = useCurrentFrame();
  const currentSec = progress * durationSec;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  return (
    <div style={{background: 'rgba(255,255,255,0.85)', borderRadius: 30, padding: '22px 30px 24px', width: '86%', border: '1px solid #FFFFFF', boxShadow: '0 10px 40px rgba(30,36,48,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
      {/* now playing label */}
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 15, color: SOFT, letterSpacing: 3, textTransform: 'uppercase'}}>
          Now Playing
        </div>
        {/* equalizer dots */}
      <div style={{display: 'flex', gap: 3, alignItems: 'center', height: 14}}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{width: 3, height: `${5 + Math.abs(Math.sin((eqFrame * i * 0.13)) + i) * 8}px`, borderRadius: 1, background: RED}} />
        ))}
      </div>
    </div>

    <PlayButton />
    <WaveformBars progress={progress} />
    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
      <span style={{fontFamily: 'Vazirmatn, sans-serif', fontSize: 16, color: RED, fontWeight: 700}}>{fmt(currentSec)}</span>
      <span style={{fontFamily: 'Vazirmatn, sans-serif', fontSize: 16, color: SOFT, fontWeight: 700}}>{fmt(durationSec)}</span>
    </div>
  </div>
);
};

function frameNowPublic(_i: number): number {
  return 0;
}

/* ── branded pill ── */
const BrandPill: React.FC = () => {
  const frame = useCurrentFrame();
  const onAir = Math.sin(frame * 0.28) > 0.4;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(230,59,74,0.08)', border: '1px solid rgba(230,59,74,0.25)', borderRadius: 40, padding: '8px 18px'}}>
      <div style={{width: 10, height: 10, borderRadius: '50%', background: onAir ? RED : 'rgba(230,59,74,0.35)'}} />
      <span style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 17, color: RED_DEEP, letterSpacing: 0.5}}>راديو القرآن — QURAN FM</span>
    </div>
  );
};

/* ── light open card ── */
const LightOpenCard: React.FC<{ayah: any}> = ({ayah}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, 30, 40], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scaleUp = interpolate(frame, [0, 30], [0.9, 1], {extrapolateRight: 'clamp'});
  const enName = SURAH_EN[ayah.surah] || '';
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', opacity, padding: '0 8%'}}>
      <SoftBlobs />
      <BrandPill />
      <div style={{fontFamily: Fonts.quran, fontSize: 40, color: BLUE, fontWeight: 700, marginTop: 26, opacity: 0.85}}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 96, color: INK, textAlign: 'center', marginTop: 24, transform: `scale(${scaleUp})`, lineHeight: 1.6}}>
        سُورَةُ {ayah.surah_name}
      </div>
      <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 700, fontSize: 24, color: SOFT, marginTop: 12, letterSpacing: 2, textTransform: 'uppercase'}}>
        {enName} · {ayah.ayah}
      </div>
      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 30, color: RED, marginTop: 18}}>يَاسِر الدُّوسَرِي</div>
    </AbsoluteFill>
  );
};

/* ── main composition ── */
export const PlayerShort: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const ayah = ayahs[index] || ayahs[0];
  const arabic = cleanArabic(ayah.arabic);
  const enText = enOf(ayah);
  const words = wordsOf(arabic);
  const wordDur = Math.max(4, (words.length * 1.2) / fps);
  const timings = wordTimings(arabic, wordDur);
  const active = activeWordIndex(frame, fps, timings);

  const bodyFrom = OPEN_DUR;
  const bodyDur = durationInFrames - OPEN_DUR - END_DUR;
  const bodyFrame = Math.max(0, frame - bodyFrom);
  const bodyProgress = Math.min(1, bodyFrame / Math.max(bodyDur - 1, 1));
  const durationSec = bodyDur / fps;
  const enName = SURAH_EN[ayah.surah] || '';

  const bodyOpacity = interpolate(frame, [bodyFrom, bodyFrom + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const endFrom = Math.max(OPEN_DUR, durationInFrames - END_DUR);

  return (
    <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
      <Sequence from={0} durationInFrames={endFrom} name="bg">
        <SoftBlobs />
        <FloatingDots />
      </Sequence>

      {/* open */}
      <Sequence from={0} durationInFrames={OPEN_DUR} name="open">
        <LightOpenCard ayah={ayah} />
      </Sequence>

      {/* body */}
      <Sequence from={bodyFrom} durationInFrames={bodyDur} name="body">
        <AbsoluteFill style={{opacity: bodyOpacity, display: 'flex', flexDirection: 'column', padding: '52px 0 0', alignItems: 'center'}}>
          <BrandPill />

          {/* surah name (AR) + ayah (EN) */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16, marginBottom: 8, gap: 4}}>
            <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 52, color: INK}}>سُورَةُ {ayah.surah_name}</div>
            <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 700, fontSize: 20, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4}}>
              {enName} · Ayah {ayah.ayah}
            </div>
          </div>

          {/* arabic text */}
          <div style={{maxWidth: '92%', textAlign: 'center', fontFamily: Fonts.quran, fontSize: 54, lineHeight: 1.8, color: INK, direction: 'rtl', background: 'rgba(255,255,255,0.8)', borderRadius: 22, padding: '18px 20px', marginBottom: 8, boxShadow: '0 4px 22px rgba(30,36,48,0.06)'}}>
            {words.map((w, i) => {
              const glow = i === active;
              return (
                <span key={i} style={{color: glow ? RED : INK, textShadow: glow ? '0 0 16px rgba(230,59,74,0.28)' : 'none', whiteSpace: 'pre'}}>
                  {w}{' '}
                </span>
              );
            })}
          </div>

          {/* english translation */}
          <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 500, fontSize: 23, color: SOFT, maxWidth: '86%', textAlign: 'center', lineHeight: 1.55, background: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: '12px 22px', marginBottom: 10, border: '1px solid rgba(47,108,255,0.14)'}}>
            &ldquo;{enText}&rdquo;
          </div>

          {/* player */}
          <PlayerCard progress={bodyProgress} durationSec={durationSec} />

          <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 20, color: SOFT, marginTop: 12}}>
            يَاسِر الدُّوسَرِي
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* end */}
      <Sequence from={endFrom} durationInFrames={durationInFrames - endFrom} name="end">
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
          <SoftBlobs />
          <LightEndCard />
        </AbsoluteFill>
      </Sequence>

      <Audio src={staticFile(audioForIndex(index))} />
    </AbsoluteFill>
  );
};

/* ── light end card ── */
const LightEndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [10, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + 0.03 * Math.sin((2 * Math.PI * frame) / 30);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, flexDirection: 'column', padding: '0 10%'}}>
      <div style={{width: 90, height: 4, background: RED, borderRadius: 2, marginBottom: 34}} />
      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 56, color: INK, textAlign: 'center', lineHeight: 1.6, direction: 'rtl'}}>
        آيةُ آرَام — راديو القرآن
      </div>
      <div style={{marginTop: 14, fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 26, color: SOFT, letterSpacing: 2, textTransform: 'uppercase'}}>
        New Ayah Every Day
      </div>
      <div style={{marginTop: 24, fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 34, color: RED, transform: `scale(${pulse})`}}>
        @islamrazekhoshabkhte
      </div>
      <div style={{display: 'flex', flexDirection: 'row', gap: 22, justifyContent: 'center', marginTop: 34}}>
        <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 24, color: '#FFFFFF', background: RED, padding: '12px 26px', borderRadius: 40, boxShadow: '0 6px 18px rgba(230,59,74,0.3)'}}>Like</div>
        <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 24, color: '#FFFFFF', background: BLUE, padding: '12px 26px', borderRadius: 40, boxShadow: '0 6px 18px rgba(47,108,255,0.3)'}}>Subscribe</div>
      </div>
    </AbsoluteFill>
  );
};