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

export const TT_OPEN = 85;
export const TT_END = 100;

const SEGMENTS = ['آیه‌ای از قرآن کریم', 'با تلاوت استاد یاسر الدوسری', 'تدبر در معنا'];

const TextBlock: React.FC<{ayah: Ayah}> = ({ayah}) => {
  const frame = useCurrentFrame();
  const segDur = 60;
  const stage = Math.min(Math.floor(frame / segDur), SEGMENTS.length - 1);
  const local = frame - stage * segDur;

  const yOff = interpolate(local, [0, 20], [30, 0], {extrapolateRight: 'clamp'});
  const opacity = interpolate(local, [0, 18, segDur - 15, segDur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const zoom = interpolate(local, [0, segDur], [0.95, 1.05], {extrapolateRight: 'clamp'});

  const arabic = cleanArabic(ayah.arabic);
  const farsi = faOf(ayah);

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          fontFamily: Fonts.fa,
          fontWeight: 900,
          fontSize: 74,
          color: '#FFFFFF',
          opacity,
          transform: `translateY(${yOff}px) scale(${zoom})`,
          textAlign: 'center',
          direction: 'rtl',
          padding: '0 8%',
          lineHeight: 1.5,
          textShadow: `0 0 30px rgba(232,179,96,0.4)`,
        }}
      >
        {SEGMENTS[stage]}
      </div>
      <AbsoluteFill style={{top: '58%', alignItems: 'center', opacity}}>
        <div
          style={{
            fontFamily: Fonts.quran,
            fontSize: 66,
            color: '#FFF4D6',
            direction: 'rtl',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '86%',
            textShadow: `0 0 30px rgba(232,179,96,0.3)`,
          }}
        >
          {arabic}
        </div>
        <div style={{width: 50, height: 2, background: GOLD, margin: '20px 0'}} />
        <div
          style={{
            fontFamily: Fonts.fa,
            fontWeight: 900,
            fontSize: 34,
            color: GOLD_LIGHT,
            direction: 'rtl',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.5,
          }}
        >
          {farsi}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Footer: React.FC<{ayah: Ayah}> = ({ayah}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [20, 60], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{top: '85%', alignItems: 'center', opacity, flexDirection: 'column', gap: 8}}>
      <div style={{fontFamily: Fonts.fa, fontWeight: 700, fontSize: 28, color: GOLD}}>
        {ayah.ref} — یاسر الدوسری
      </div>
      <div style={{fontFamily: Fonts.fa, fontWeight: 700, fontSize: 20, color: 'rgba(214,222,236,0.8)'}}>
        تلاوت و ترجمه
      </div>
    </AbsoluteFill>
  );
};

const Main: React.FC<{index: number}> = ({index}) => {
  const ayah = ayahs[index] || ayahs[0];
  return (
    <AbsoluteFill>
      <VideoBackground index={index} />
      <Overlay />
      <TextBlock ayah={ayah} />
      <Footer ayah={ayah} />
    </AbsoluteFill>
  );
};

const Overlay: React.FC = () => <AbsoluteFill style={{background: 'rgba(10,15,30,0.5)'}} />;

export const TextTemplate: React.FC<{index: number}> = ({index}) => {
  const {durationInFrames} = useVideoConfig();
  const ayah = ayahs[index] || ayahs[0];
  const endFrom = Math.max(TT_OPEN, durationInFrames - TT_END);

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      <Sequence from={0} durationInFrames={TT_OPEN} name="open">
        <AbsoluteFill>
          <VideoBackground index={index} />
          <Overlay />
          <OpenCard mode="wide" title="قرآن کریم" subtitle={ayah.ref} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={TT_OPEN} durationInFrames={endFrom - TT_OPEN} name="main">
        <Main index={index} />
      </Sequence>
      <Sequence from={endFrom} durationInFrames={durationInFrames - endFrom} name="end">
        <AbsoluteFill>
          <VideoBackground index={index + 1} />
          <Overlay />
          <EndCard mode="wide" />
        </AbsoluteFill>
      </Sequence>
      <Audio src={staticFile(audioForIndex(index))} />
    </AbsoluteFill>
  );
};
