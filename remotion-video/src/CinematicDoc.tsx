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
  type Ayah,
} from './data';
import {OpenCard, EndCard, VideoBackground, Fonts} from './visuals';

export const DOC_OPEN = 85; // ~2.8s
export const DOC_END = 100; // ~3.3s

const LETTERBOX = 0.12;

const Letterbox: React.FC = () => {
  return (
    <>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: `${LETTERBOX * 100}%`, background: 'black'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: `${LETTERBOX * 100}%`, background: 'black'}} />
    </>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,0.85)'}} />
);

const Chapter: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 40, 90], [0, 1, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(frame, [0, 40], [40, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{top: '17%', left: '6%', opacity, flexDirection: 'column', alignItems: 'flex-start', transform: `translateY(${y}px)`}}>
      <div
        style={{
          fontFamily: Fonts.fa,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 6,
          color: GOLD,
          textTransform: 'uppercase',
        }}
      >
        الماس معنوی
      </div>
      <div style={{width: 80, height: 3, background: GOLD, margin: '18px 0'}} />
      <div style={{fontFamily: Fonts.fa, fontWeight: 900, fontSize: 44, color: '#FFFFFF'}}>
        تلاوت و تدبر
      </div>
    </AbsoluteFill>
  );
};

const CinematicQuote: React.FC<{ayah: Ayah}> = ({ayah}) => {
  const frame = useCurrentFrame();
  const arabic = cleanArabic(ayah.arabic);
  const farsi = faOf(ayah);
  const opacity = interpolate(frame, [0, 60], [0, 1], {extrapolateRight: 'clamp'});
  const arabicScale = interpolate(frame, [0, 70], [0.94, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, padding: '0 12%', flexDirection: 'column'}}>
      <div
        style={{
          fontFamily: Fonts.quran,
          fontSize: 88,
          color: '#FFF4D6',
          direction: 'rtl',
          textAlign: 'center',
          lineHeight: 1.5,
          textShadow: `0 0 40px rgba(232,179,96,0.35)`,
          transform: `scale(${arabicScale})`,
        }}
      >
        {arabic}
      </div>
      <div style={{width: 60, height: 2, background: GOLD, margin: '30px 0'}} />
      <div
        style={{
          fontFamily: Fonts.fa,
          fontWeight: 900,
          fontSize: 38,
          color: GOLD_LIGHT,
          direction: 'rtl',
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: '80%',
        }}
      >
        {farsi}
      </div>
    </AbsoluteFill>
  );
};

const CinematicFooter: React.FC<{ayah: Ayah}> = ({ayah}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [60, 100], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        bottom: `${LETTERBOX * 100 + 3}%`,
        left: '6%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        opacity,
      }}
    >
      <div style={{fontFamily: Fonts.fa, fontWeight: 700, fontSize: 26, color: '#FFFFFF'}}>{ayah.ref}</div>
      <div style={{width: 40, height: 2, background: GOLD}} />
      <div style={{fontFamily: Fonts.fa, fontWeight: 700, fontSize: 20, color: GOLD}}>یاسر الدوسری</div>
    </AbsoluteFill>
  );
};

const Main: React.FC<{index: number}> = ({index}) => {
  const ayah = ayahs[index] || ayahs[0];
  return (
    <AbsoluteFill>
      <VideoBackground index={index} />
      <Letterbox />
      <Vignette />
      <FadeIn>
        <Chapter />
        <CinematicQuote ayah={ayah} />
        <CinematicFooter ayah={ayah} />
      </FadeIn>
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 40], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const CinematicDoc: React.FC<{index: number}> = ({index}) => {
  const {durationInFrames} = useVideoConfig();
  const ayah = ayahs[index] || ayahs[0];
  const endFrom = Math.max(DOC_OPEN, durationInFrames - DOC_END);

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      <Sequence from={0} durationInFrames={DOC_OPEN} name="open">
        <AbsoluteFill>
          <VideoBackground index={index} />
          <Letterbox />
          <OpenCard mode="wide" title="تلاوت و تدبر" subtitle={ayah.ref} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={DOC_OPEN} durationInFrames={endFrom - DOC_OPEN} name="main">
        <Main index={index} />
      </Sequence>
      <Sequence from={endFrom} durationInFrames={durationInFrames - endFrom} name="end">
        <AbsoluteFill>
          <VideoBackground index={index + 1} />
          <Letterbox />
          <EndCard mode="wide" />
        </AbsoluteFill>
      </Sequence>
      <Audio src={staticFile(audioForIndex(index))} />
    </AbsoluteFill>
  );
};
