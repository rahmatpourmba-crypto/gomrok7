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
  faOf,
  GOLD,
  GOLD_LIGHT,
  RECITER_LABEL,
  wordsOf,
  wordTimings,
  activeWordIndex,
  type Ayah,
} from './data';
import {OpenCard, EndCard, VideoBackground, Fonts} from './visuals';

export const SHORTS_OPEN = 45; // 1.5s — تلاوت سریع‌تر شروع شود (افزایش واتچرو Shorts)
export const SHORTS_END = 90; // 3s

const ArabicOverlay: React.FC<{ayah: Ayah; showWord: boolean}> = ({
  ayah,
  showWord,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const arabic = cleanArabic(ayah.arabic);
  const words = wordsOf(arabic);
  const timings = wordTimings(arabic, Math.max(4, (words.length * 1.2) / fps));
  const active = activeWordIndex(frame, fps, timings);

  const wordStyle = (i: number): React.CSSProperties => {
    const glow = i === active && showWord;
    return {
      fontFamily: Fonts.quran,
      fontSize: 60,
      lineHeight: 1.5,
      color: glow ? '#FFFFFF' : '#FFF4D6',
      textShadow: glow ? `0 0 22px ${GOLD}, 0 0 42px rgba(232,179,96,0.6)` : 'none',
      whiteSpace: 'pre',
    };
  };

  return (
    <AbsoluteFill style={{top: '16%', alignItems: 'center', padding: '0 3%'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          direction: 'rtl',
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: 'rgba(10,12,24,0.5)',
          borderRadius: 22,
          padding: '18px 22px',
          maxWidth: '96%',
          lineHeight: 1.5,
        }}
      >
        {showWord
          ? words.map((w, i) => (
              <span key={i} style={wordStyle(i)}>
                {w}{' '}
              </span>
            ))
          : arabic.split('*')[0]}
      </div>
      <div style={{height: 4}} />
    </AbsoluteFill>
  );
};

const FarsiCaption: React.FC<{text: string; durationInFrames: number}> = ({
  text,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = wordsOf(text);
  const timings = wordTimings(text, durationInFrames / fps);
  const active = activeWordIndex(frame, fps, timings);
  const maxActive = Math.min(Math.max(active, 2), words.length - 1);
  const shown = words.slice(0, maxActive + 1);

  return (
    <AbsoluteFill style={{top: '66%', alignItems: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          direction: 'rtl',
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: 'rgba(8,10,20,0.75)',
          borderRadius: 20,
          padding: '16px 34px',
          maxWidth: '88%',
          lineHeight: 1.4,
          border: `1px solid rgba(232,179,96,0.25)`,
          boxShadow: '0 6px 30px rgba(0,0,0,0.4)',
        }}
      >
        {shown.map((w, idx) => {
          const isVisible = idx <= active;
          const isCurrent = idx === active;
          return (
            <span
              key={idx}
              style={{
                fontFamily: Fonts.fa,
                fontWeight: 900,
                fontSize: 50,
                color: isCurrent ? GOLD : GOLD_LIGHT,
                textShadow: isCurrent ? `0 0 18px ${GOLD}` : 'none',
                opacity: isVisible ? 1 : 0.15,
                whiteSpace: 'pre',
              }}
            >
              {w}{' '}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const MetaFooter: React.FC<{ayah: Ayah}> = ({ayah}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '11%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: Fonts.fa,
          fontWeight: 900,
          fontSize: 30,
          color: GOLD_LIGHT,
        }}
      >
        {ayah.ref}
      </div>
      <div
        style={{
          fontFamily: Fonts.fa,
          fontWeight: 700,
          fontSize: 22,
          color: 'rgba(214,222,236,0.95)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span>{RECITER_LABEL}</span>
        <span style={{color: GOLD}}>•</span>
        <span style={{color: GOLD}}>تلاوت قرآن</span>
      </div>
    </div>
  );
};

const Main: React.FC<{index: number}> = ({index}) => {
  const {durationInFrames} = useVideoConfig();
  const ayah = ayahs[index] || ayahs[0];
  const text = faOf(ayah);
  return (
    <AbsoluteFill>
      <VideoBackground index={index} vertical />
      <FadeInMain>
        <ArabicOverlay ayah={ayah} showWord />
        <FarsiCaption text={text} durationInFrames={durationInFrames} />
        <MetaFooter ayah={ayah} />
      </FadeInMain>
    </AbsoluteFill>
  );
};

const FadeInMain: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const QuranShorts: React.FC<{index: number}> = ({index}) => {
  const {durationInFrames} = useVideoConfig();
  const ayah = ayahs[index] || ayahs[0];
  const endFrom = Math.max(SHORTS_OPEN, durationInFrames - SHORTS_END);

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      <Sequence from={0} durationInFrames={SHORTS_OPEN} name="open">
        <AbsoluteFill>
          <VideoBackground index={index} vertical />
          <OpenCard mode="shorts" title="آیه‌ای برای آرامش قلب" subtitle={`${ayah.ref} • یاسر الدوسری`} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={SHORTS_OPEN} durationInFrames={endFrom - SHORTS_OPEN} name="main">
        <Main index={index} />
      </Sequence>
      <Sequence from={endFrom} durationInFrames={durationInFrames - endFrom} name="end">
        <AbsoluteFill>
          <VideoBackground index={index + 1} vertical />
          <EndCard mode="shorts" />
        </AbsoluteFill>
      </Sequence>
      <Audio src={staticFile(audioForIndex(index))} />
    </AbsoluteFill>
  );
};
