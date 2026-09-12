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

const GOLD = '#E8B360';
const GOLD_LIGHT = '#FFE2A8';
const INK = '#0A0F16';
const PAPER = '#FFFFFF';
const GREEN = '#2EC47E';
const GREEN_DEEP = '#0E7B52';

const FPS = 30;
const W = 1080;
const H = 1920;

export const CQ_OPEN = 50;
export const CQ_MIN_SECONDS = 35;

export type CustomQ = {
  num: number;
  question: string;
  options: [string, string, string, string];
  correct: number;
  reason: string;
  audio: {q: number; o1: number; o2: number; o3: number; o4: number; a: number; r: number};
};

export const cqAudioFor = (num: number, part: string) =>
  staticFile(`/customs/q${num}_${part}.mp3`);

type Timing = {
  o1: number;
  o2: number;
  o3: number;
  o4: number;
  aStart: number;
  rStart: number;
  end: number;
};

const T30 = (s: number) => Math.ceil(s * FPS);
const GAP = 10;
// extra tail frame allowance so Remotion's audio-start latency never
// truncates the last part of a spoken segment.
const APAD = 18;
const ALEN = (s: number) => Math.ceil(s * FPS) + APAD;

export const cqTiming = (q: CustomQ): Timing => {
  const qEnd = CQ_OPEN + ALEN(q.audio.q);
  const o1 = qEnd + GAP;
  const o2 = o1 + ALEN(q.audio.o1) + GAP;
  const o3 = o2 + ALEN(q.audio.o2) + GAP;
  const o4 = o3 + ALEN(q.audio.o3) + GAP;
  const aStart = o4 + ALEN(q.audio.o4) + GAP;
  const rStart = aStart + ALEN(q.audio.a) + GAP;
  const rEnd = rStart + ALEN(q.audio.r);
  const end = Math.max(rEnd, CQ_MIN_SECONDS * FPS) + 60;
  return {o1, o2, o3, o4, aStart, rStart, end};
};

const oStartOf = (t: Timing, i: number) => (i === 0 ? t.o1 : i === 1 ? t.o2 : i === 2 ? t.o3 : t.o4);
const durOf = (q: CustomQ, i: number) =>
  ALEN((i === 0 ? q.audio.o1 : i === 1 ? q.audio.o2 : i === 2 ? q.audio.o3 : q.audio.o4));

const OPT_KEYS = ['o1', 'o2', 'o3', 'o4'] as const;

// ---- visual helpers ----
const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        'radial-gradient(130% 130% at 50% 90%, rgba(232,179,96,0.16) 0%, rgba(10,15,22,0) 50%)',
    }}
  />
);

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      mixBlendMode: 'overlay',
    }}
  />
);

const Header: React.FC<{num: number}> = ({num}) => (
  <div style={{position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 5}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <div
        style={{
          color: GOLD_LIGHT,
          fontFamily: 'Vazirmatn',
          fontWeight: 900,
          fontSize: 42,
          textShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        آزمون کارگزاری گمرک
      </div>
      <div
        style={{
          background: 'linear-gradient(135deg, #1A2332, #101722)',
          border: `1.5px solid ${GOLD}`,
          color: GOLD,
          fontFamily: 'Vazirmatn',
          fontWeight: 900,
          fontSize: 30,
          borderRadius: 14,
          padding: '4px 18px',
          minWidth: 70,
          textAlign: 'center',
        }}
      >
        س{num}
      </div>
    </div>
  </div>
);

const Question: React.FC<{q: CustomQ; show: boolean}> = ({q, show}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [CQ_OPEN, CQ_OPEN + 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        opacity: show ? o : 0,
        fontFamily: 'Vazirmatn',
        fontWeight: 700,
        fontSize: 38,
        lineHeight: 1.7,
        color: PAPER,
        direction: 'rtl',
        textAlign: 'right',
        textShadow: '0 4px 30px rgba(0,0,0,0.45)',
      }}
    >
      {q.question}
    </div>
  );
};

const PERSIAN_DIGITS = ['۱', '۲', '۳', '۴'];
const labelOf = (n: number) => PERSIAN_DIGITS[n - 1];

const OptionCard: React.FC<{
  text: string;
  idx: number;
  oStart: number;
  isCorrect: boolean;
  answered: boolean;
}> = ({text, idx, oStart, isCorrect, answered}) => {
  const frame = useCurrentFrame();
  const local = frame - oStart;
  const o = interpolate(local, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(local, [0, 18], [22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shown = frame >= oStart;

  let bg = 'rgba(255,255,255,0.06)';
  let br = 'rgba(255,255,255,0.18)';
  let numBg = '#1A2332';
  let numCol = GOLD_LIGHT;
  if (answered && isCorrect) {
    bg = 'rgba(46,196,126,0.20)';
    br = GREEN;
    numBg = GREEN;
    numCol = '#04170E';
  }
  const glow = answered && isCorrect ? `0 0 46px rgba(46,196,126,0.55)` : 'none';

  return (
    <div
      style={{
        opacity: shown ? o : 0,
        transform: `translateY(${shown ? y : 0}px)`,
        width: '100%',
        background: bg,
        border: `1.5px solid ${br}`,
        borderRadius: 16,
        padding: '18px 26px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        boxShadow: glow,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 13,
          background: numBg,
          color: numCol,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Vazirmatn',
          fontWeight: 900,
          fontSize: 30,
          flexShrink: 0,
        }}
      >
        {labelOf(idx)}
      </div>
      <div
        style={{
          fontFamily: 'Vazirmatn',
          fontWeight: 700,
          fontSize: 30,
          lineHeight: 1.6,
          color: PAPER,
          direction: 'rtl',
          textAlign: 'right',
        }}
      >
        {text}
      </div>
    </div>
  );
};

const AnswerBadge: React.FC<{correct: number; aStart: number}> = ({correct, aStart}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [aStart, aStart + 26], [0, 1], {extrapolateRight: 'clamp'});
  const s = interpolate(frame, [aStart, aStart + 26], [0.7, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{alignSelf: 'center', opacity: o, transform: `scale(${s})`, flexShrink: 0}}>
      <div
        style={{
          background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DEEP})`,
          borderRadius: 16,
          padding: '12px 38px',
          fontFamily: 'Vazirmatn',
          fontWeight: 900,
          fontSize: 34,
          color: '#04170E',
          boxShadow: '0 8px 44px rgba(46,196,126,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span>پاسخ صحیح:</span>
        <span style={{fontSize: 42}}>{labelOf(correct)}</span>
      </div>
    </div>
  );
};

const Reason: React.FC<{q: CustomQ; rStart: number}> = ({q, rStart}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [rStart, rStart + 22], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        opacity: o,
        width: '100%',
        background: 'rgba(232,179,96,0.10)',
        border: '1.5px solid rgba(232,179,96,0.45)',
        borderRadius: 16,
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{fontFamily: 'Vazirmatn', fontWeight: 900, fontSize: 26, color: GOLD}}>دلیل / ارجاع</div>
      <div
        style={{
          fontFamily: 'Vazirmatn',
          fontWeight: 700,
          fontSize: 27,
          lineHeight: 1.65,
          color: PAPER,
          direction: 'rtl',
          textAlign: 'right',
        }}
      >
        {q.reason || 'طبق مفاد قانون امور گمرکی'}
      </div>
    </div>
  );
};

const Brand: React.FC = () => (
  <div
    style={{
      alignSelf: 'center',
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fontSize: 24,
      color: 'rgba(232,179,96,0.85)',
      marginTop: 4,
      flexShrink: 0,
    }}
  >
    کارگزاری گمرکی منابع
  </div>
);

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'linear-gradient(175deg, #0B1220 0%, #101A2C 45%, #0A0F16 100%)',
    }}
  />
);

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          fontFamily: 'Vazirmatn',
          fontWeight: 900,
          fontSize: 66,
          color: GOLD,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        کانال منابع
      </div>
      <div
        style={{
          fontFamily: 'Vazirmatn',
          fontWeight: 700,
          fontSize: 38,
          color: PAPER,
          textAlign: 'center',
          lineHeight: 1.8,
          marginTop: 20,
        }}
      >
        کارگزاری گمرکی
      </div>
    </AbsoluteFill>
  );
};

const Main: React.FC<{q: CustomQ; t: Timing}> = ({q, t}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{width: W, height: H}}>
      <Background />
      <Vignette />
      <Grain />
      <Header num={q.num} />
      {/* Content anchored to bottom, scrollable if taller than screen */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 180,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 100,
          paddingLeft: 52,
          paddingRight: 52,
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxHeight: '100%',
            overflowY: 'auto',
            paddingBottom: 8,
          }}
        >
          <Question q={q} show={frame >= CQ_OPEN} />
          {q.options.map((opt, i) => (
            <OptionCard
              key={i}
              text={opt}
              idx={i + 1}
              oStart={oStartOf(t, i)}
              isCorrect={q.correct === i + 1}
              answered={frame >= t.aStart}
            />
          ))}
          <AnswerBadge correct={q.correct} aStart={t.aStart} />
          <Reason q={q} rStart={t.rStart} />
          <Brand />
        </div>
      </div>
      <Sequence from={CQ_OPEN} durationInFrames={ALEN(q.audio.q)}>
        <Audio src={cqAudioFor(q.num, 'q')} />
      </Sequence>
      {OPT_KEYS.map((k, i) => (
        <Sequence key={k} from={oStartOf(t, i)} durationInFrames={durOf(q, i)}>
          <Audio src={cqAudioFor(q.num, k)} />
        </Sequence>
      ))}
      <Sequence from={t.aStart} durationInFrames={ALEN(q.audio.a)}>
        <Audio src={cqAudioFor(q.num, 'a')} />
      </Sequence>
      <Sequence from={t.rStart} durationInFrames={ALEN(q.audio.r)}>
        <Audio src={cqAudioFor(q.num, 'r')} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const CustomsQuestion: React.FC<{q: CustomQ}> = ({q}) => {
  const {durationInFrames} = useVideoConfig();
  const t = cqTiming(q);
  const outroFrom = Math.max(t.rStart + ALEN(q.audio.r), durationInFrames - 60);
  return (
    <AbsoluteFill style={{width: W, height: H, backgroundColor: '#05070c'}}>
      <Sequence from={0} durationInFrames={outroFrom}>
        <Main q={q} t={t} />
      </Sequence>
      <Sequence from={outroFrom} durationInFrames={durationInFrames - outroFrom}>
        <AbsoluteFill style={{width: W, height: H}}>
          <Background />
          <Vignette />
          <Grain />
          <Outro />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
