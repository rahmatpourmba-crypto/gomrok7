import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CHANNEL} from './channel';
import {Fonts} from './visuals';

const GOLD = '#E8B360';
const GOLD_LIGHT = '#FFDE96';
const WHITE = '#FFFFFF';

const OPEN_FRAMES = 48; // 1.6s hook
const END_FRAMES = 70; // 2.4s end card
const BACKEND_FRAMES = 14;

// ===== سه آیهٔ جهانی، پشت سر هم (برای خلاصه = واتچرو بالا و وایرال) =====
const SEGMENTS = [
  {
    ar: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    en: ['Hearts', 'find', 'peace', 'in', 'the', 'remembrance', 'of', 'Allah.'],
    ref: 'Quran 13:28 • Ar-Ra`d',
    audio: '/tilawat/q_009.mp3',
    dur: 16.05,
    bg: 0, // mountains warm
  },
  {
    ar: 'أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ',
    en: ['Is', 'not', 'Allah', 'sufficient', 'for', 'His', 'servant?'],
    ref: 'Quran 39:36 • Az-Zumar',
    audio: '/tilawat/q_048.mp3',
    dur: 16.44,
    bg: 3, // stars
  },
  {
    ar: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا\nإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    en: ['With', 'hardship', 'comes', 'EASE', '—', 'twice,', 'Quran', 'promises.'],
    ref: 'Quran 94:5-6 • Ash-Sharh',
    audio: '/tilawat/q_003.mp3',
    dur: 7.31,
    bg: 1, // ocean
  },
];

const BGS = ['bg_mountains.mp4', 'bg_ocean.mp4', 'bg_waterfall.mp4', 'bg_stars.mp4', 'bg_meadow.mp4', 'bg_sunset_clouds.mp4'];

const kitburns = (frame: number, durationInFrames: number, startFrom = 0) => {
  const local = Math.max(frame - startFrom, 0);
  const p = local / Math.max(durationInFrames - 1, 1);
  const scale = 1 + 0.1 * p;
  return `scale(${scale}) translateY(${(1 - scale) * 50}%)`;
};

const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18, OPEN_FRAMES - 14, OPEN_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rise = interpolate(frame, [0, 22], [28, 0], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, background: 'rgba(3,5,12,0.5)', transform: `translateY(${rise}px)`, flexDirection: 'column', padding: '0 8%'}}>
      <div style={{fontFamily: Fonts.fa, fontWeight: 400, fontSize: 44, color: '#FFFFFF', textAlign: 'center', lineHeight: 1.6, direction: 'rtl'}}>
        اضطراب داری؟ دل‌ات سنگینه؟
      </div>
      <div style={{width: 110, height: 4, background: GOLD, borderRadius: 2, margin: '24px 0', transform: `scaleX(${interpolate(frame, [10, 30], [0, 1], {extrapolateRight: 'clamp'})})`}} />
      <div style={{fontFamily: Fonts.sans, fontWeight: 900, fontSize: 92, color: WHITE, textAlign: 'center', lineHeight: 1.2}}>
        3 verses for your heart
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 700, fontSize: 32, color: GOLD_LIGHT, marginTop: 22}}>stay till the end — it gets better 👇</div>
    </AbsoluteFill>
  );
};

const VerseSegment: React.FC<{seg: (typeof SEGMENTS)[number]}> = ({seg}) => {
  const frame = useCurrentFrame();
  const local = frame;
  const {fps} = useVideoConfig();
  const t = local / fps;
  const opacity = interpolate(local, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const per = seg.dur / seg.en.length;
  const active = Math.min(Math.max(Math.floor(t / per), -1), seg.en.length - 1);
  const arLines = seg.ar.split('\n');

  return (
    <AbsoluteFill style={{opacity, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 5%'}}>
      <div style={{fontFamily: Fonts.quran, fontSize: 96, color: WHITE, textAlign: 'center', lineHeight: 1.6, direction: 'rtl', marginBottom: 30, textShadow: '0 0 30px rgba(232,179,96,0.25)'}}>
        {arLines.map((ln, i) => (
          <div key={i}>{ln}</div>
        ))}
      </div>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '94%'}}>
        {seg.en.map((w, i) => {
          const isActive = i <= active;
          const isPeak = i === active;
          return (
            <span
              key={i}
              style={{
                fontFamily: Fonts.sans,
                fontWeight: 900,
                fontSize: isPeak ? 74 : 54,
                color: isPeak ? WHITE : isActive ? GOLD_LIGHT : 'rgba(220,225,235,0.35)',
                textShadow: isPeak ? `0 0 26px ${GOLD}` : 'none',
                margin: '0 7px',
                opacity: isActive ? 1 : 0.3,
                transform: `translateY(${isPeak ? -8 : 0}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 28, color: 'rgba(214,222,236,0.9)', marginTop: 26, direction: 'rtl'}}>
        {seg.ref}
      </div>
    </AbsoluteFill>
  );
};

const PayoffCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const punch = 1 + 0.04 * Math.sin((2 * Math.PI * frame) / 26);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, background: 'rgba(3,5,12,0.75)', flexDirection: 'column', padding: '0 8%'}}>
      <div style={{fontFamily: Fonts.sans, fontWeight: 400, fontSize: 38, color: GOLD_LIGHT}}>«إِنَّ مَعَ الْعُسْرِ يُسْرًا»</div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 900, fontSize: 110, color: WHITE, textAlign: 'center', lineHeight: 1.15, transform: `scale(${punch})`, marginTop: 18}}>
        Hardship
        <br />
        comes
        <br />
        with <span style={{color: GOLD}}>EASE</span>
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 34, color: 'rgba(214,222,236,0.95)', marginTop: 26, direction: 'rtl'}}>
        Whatever you're facing — hold on 🌙
      </div>
      <div style={{display: 'flex', flexDirection: 'row', gap: 20, marginTop: 30, flexWrap: 'wrap', justifyContent: 'center'}}>
        <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 32, color: WHITE, background: 'rgba(232,179,96,0.16)', border: '1px solid rgba(232,179,96,0.6)', padding: '14px 30px', borderRadius: 40}}>⬇ subscribe</div>
        <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 32, color: WHITE, background: 'rgba(232,179,96,0.16)', border: '1px solid rgba(232,179,96,0.6)', padding: '14px 30px', borderRadius: 40}}>⭐ share this</div>
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 24, color: 'rgba(214,222,236,0.7)', marginTop: 16}}>
        {CHANNEL.handle}
      </div>
    </AbsoluteFill>
  );
};

export const ViralShorts: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // چیدمان توالی: قلاب → بخش۱ → بخش۲ → بخش۳ (=پاف قرآنی) → پایانهٔ احساسی
  let cursor = OPEN_FRAMES;
  const segStarts = SEGMENTS.map((s) => {
    const st = cursor;
    cursor += Math.floor(s.dur * fps) + BACKEND_FRAMES;
    return st;
  });
  const seg3dur = Math.floor(SEGMENTS[2].dur * fps);
  const payoffStart = segStarts[2] + seg3dur;
  const totalFrames = payoffStart + END_FRAMES;

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      {/* پس‌زمینهٔ هر بخش جدا (طبق bg هر آیه) + گرادیان */}
      {SEGMENTS.map((s, i) => (
        <Sequence key={i} from={segStarts[i]} durationInFrames={Math.floor(s.dur * fps) + BACKEND_FRAMES + (i === 2 ? END_FRAMES : 0)}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(`/backgrounds/${BGS[s.bg]}`)}
              muted
              style={{position: 'absolute', left: '-40%', width: '380%', height: '100%', objectFit: 'cover', transform: kitburns(frame, Math.floor(s.dur * fps) + BACKEND_FRAMES + (i === 2 ? END_FRAMES : 0), segStarts[i])}}
            />
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.18), rgba(5,7,12,0.55))'}} />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={OPEN_FRAMES} name="hook">
        <HookCard />
      </Sequence>

      {SEGMENTS.map((s, i) => (
        <Sequence key={'v' + i} from={segStarts[i]} durationInFrames={Math.floor(s.dur * fps) + BACKEND_FRAMES} name={'verse' + i}>
          <VerseSegment seg={s} />
        </Sequence>
      ))}

      {/* پایانهٔ احساسی بعد از بخش سوم */}
      <Sequence from={payoffStart} durationInFrames={totalFrames - payoffStart} name="payoff">
        <PayoffCard />
      </Sequence>

      <Audio src={staticFile(SEGMENTS[0].audio)} />
      <Sequence from={segStarts[1]}>
        <Audio src={staticFile(SEGMENTS[1].audio)} />
      </Sequence>
      <Sequence from={segStarts[2]}>
        <Audio src={staticFile(SEGMENTS[2].audio)} />
      </Sequence>
    </AbsoluteFill>
  );
};
