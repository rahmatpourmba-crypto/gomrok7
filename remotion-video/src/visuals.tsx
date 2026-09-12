import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {GOLD, GOLD_LIGHT} from './data';
import {CHANNEL} from './channel';

export const Fonts = {
  quran: 'Amiri, serif',
  fa: 'Vazirmatn, sans-serif',
  sans: 'Vazirmatn, "Segoe UI", Arial, sans-serif',
};

// ordered cinematic background clips (720p, landscape) — picked per ayah index
export const BACKGROUND_CLIPS = [
  'bg_mountains.mp4',
  'bg_ocean.mp4',
  'bg_waterfall.mp4',
  'bg_stars.mp4',
  'bg_meadow.mp4',
  'bg_sunset_clouds.mp4',
];

export const backgroundForIndex = (index: number): string =>
  BACKGROUND_CLIPS[index % BACKGROUND_CLIPS.length];

type VideoBackgroundProps = {
  index: number;
  vertical?: boolean; // crop for 9:16 when true, else 16:9 cover
  zoomAmount?: number;
};

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  index,
  vertical = false,
  zoomAmount = 0.08,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const src = staticFile(`/backgrounds/${backgroundForIndex(index)}`);
  const p = frame / Math.max(durationInFrames - 1, 1);
  const scale = 1 + zoomAmount * p;

  const landscapeCover = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transform: `scale(${scale})`,
  };

  // For vertical (9:16) we crop the center band of the landscape source.
  // We size the element taller than the frame width ratio so the middle
  // horizontal band fills the tall frame, then scale for the ken burns.
  const verticalCover = {
    position: 'absolute' as const,
    left: '-40%',
    width: '380%',
    height: '100%',
    objectFit: 'cover' as const,
    transform: `scale(${scale}) translateY(${(1 - scale) * 50}%)`,
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      <OffthreadVideo
        src={src}
        style={vertical ? verticalCover : landscapeCover}
        muted
      />
    </AbsoluteFill>
  );
};

type TitleCardProps = {
  mode: 'shorts' | 'wide';
  title: string;
  subtitle?: string;
};

export const OpenCard: React.FC<TitleCardProps> = ({mode, title, subtitle}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const local = frame;
  const opacity = interpolate(local, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scaleUp = interpolate(local, [0, 70], [0.9, 1], {extrapolateRight: 'clamp'});
  const isShorts = mode === 'shorts';
  const titleSize = isShorts ? 84 : 72;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        background: 'rgba(3,5,12,0.55)',
        flexDirection: 'column',
        padding: '0 10%',
      }}
    >
      <div
        style={{
          width: isShorts ? 96 : 70,
          height: 4,
          background: GOLD,
          borderRadius: 2,
          marginBottom: isShorts ? 34 : 28,
        }}
      />
      <div
        style={{
          fontFamily: Fonts.fa,
          fontWeight: 900,
          fontSize: isShorts ? 40 : 30,
          color: GOLD_LIGHT,
          letterSpacing: 4,
          marginBottom: isShorts ? 22 : 18,
        }}
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
      <div
        style={{
          fontFamily: Fonts.quran,
          fontSize: titleSize,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.5,
          transform: `scale(${scaleUp})`,
          maxWidth: '90%',
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            fontFamily: Fonts.fa,
            fontWeight: 700,
            fontSize: 30,
            color: 'rgba(214,222,236,0.95)',
            marginTop: 26,
            textAlign: 'center',
            direction: 'rtl',
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

type EndCardProps = {
  mode: 'shorts' | 'wide';
};

export const EndCard: React.FC<EndCardProps> = ({mode}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const isShorts = mode === 'shorts';
  const pulse = 1 + 0.03 * Math.sin((2 * Math.PI * frame) / 30);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        background: 'rgba(3,5,12,0.72)',
        flexDirection: 'column',
        padding: '0 10%',
      }}
    >
      <div style={{width: 90, height: 4, background: GOLD, borderRadius: 2, marginBottom: 34}} />
      <div
        style={{
          fontFamily: Fonts.fa,
          fontWeight: 900,
          fontSize: isShorts ? 60 : 54,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 1.6,
          direction: 'rtl',
        }}
      >
        آیه آرامش — هر روز یک آیه
      </div>
      <div
        style={{
          marginTop: 26,
          fontFamily: Fonts.fa,
          fontWeight: 700,
          fontSize: isShorts ? 40 : 34,
          color: GOLD,
          transform: `scale(${pulse})`,
        }}
      >
        {CHANNEL.handle}
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: Fonts.fa,
          fontWeight: 700,
          fontSize: 22,
          color: 'rgba(214,222,236,0.8)',
        }}
      >
        {CHANNEL.url} — دنبال کنید
      </div>
      <div style={{display: 'flex', flexDirection: 'row', gap: 22, flexWrap: 'wrap', justifyContent: 'center', marginTop: 30}}>
        <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 26, color: '#FFFFFF', background: 'rgba(232,179,96,0.16)', border: '1px solid rgba(232,179,96,0.55)', padding: '12px 22px', borderRadius: 40}}>👍 لایک کن</div>
        <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 26, color: '#FFFFFF', background: 'rgba(232,179,96,0.16)', border: '1px solid rgba(232,179,96,0.55)', padding: '12px 22px', borderRadius: 40}}>🔔 دنبال کن</div>
      </div>
    </AbsoluteFill>
  );
};

export const FadeInOverlay: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

// Procedural cinematic background — no external footage, renders at native
// resolution (crisp at any size). Layered drifting light blooms + aurora band,
// vignette + film grain for a premium, non-repeating-visible look.
const BLOOM_PALETTES: Array<[string, string, string]> = [
  ['#0b1024', '#3d2c14', '#e8b360'], // night gold
  ['#04121a', '#0f4a3a', '#d7f5e3'], // emerald deep
  ['#0c2233', '#1b4f6b', '#ffd9a0'], // ocean dusk
  ['#0a0c1c', '#241a45', '#bfe0ff'], // star indigo
  ['#14120a', '#54271a', '#ffd980'], // desert amber
  ['#0e1412', '#1c3a33', '#cdffea'], // forest.
];

export const ProceduralBackground: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const [deep, mid, glow] = BLOOM_PALETTES[index % BLOOM_PALETTES.length];
  const t = frame / Math.max(durationInFrames - 1, 1);
  const drift = (speed: number, amp: number, phase: number) =>
    50 + amp * Math.sin((2 * Math.PI * t) * speed + phase);
  const breathe = 0.94 + 0.06 * Math.sin((2 * Math.PI * frame) / 260);
  const ox = (f: number) => width * 0.28 + width * 0.1 * Math.sin((2 * Math.PI * t) * 0.5 + f);
  const oy = (f: number) => height * 0.3 + height * 0.06 * Math.cos((2 * Math.PI * t) * 0.42 + f);
  const grainOpacity = (0.035 + 0.02 * Math.sin(frame * 1.7)) * 1;

  return (
    <AbsoluteFill style={{backgroundColor: deep}}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${deep} 0%, ${mid} 78%, ${deep} 100%)`,
          transform: `scale(${1.02 + 0.03 * t})`,
          filter: 'blur(30px)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${drift(0.3, 9, 1)}% ${drift(0.26, 8, 2)}%, ${glow}44 0%, rgba(0,0,0,0) 42%)`,
          transform: `scale(${breathe})`,
        }}
      />
      <AbsoluteFill style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute', width: width * 0.7, height: width * 0.7,
            left: ox(0.4), top: oy(0.9), borderRadius: '50%',
            background: `radial-gradient(circle, ${glow}59 0%, rgba(0,0,0,0) 60%)`,
            filter: 'blur(40px)', opacity: 0.85,
          }}
        />
        <div
          style={{
            position: 'absolute', width: width * 0.6, height: width * 0.6,
            left: width - ox(2.2), top: height - oy(1.7), borderRadius: '50%',
            background: `radial-gradient(circle, ${mid}90 0%, rgba(0,0,0,0) 62%)`,
            filter: 'blur(50px)', opacity: 0.9,
          }}
        />
        <div
          style={{
            position: 'absolute', width: width * 1.2, height: width * 0.3,
            left: -width * 0.1, top: height * 0.14,
            background: `linear-gradient(90deg, rgba(0,0,0,0), ${glow}38 50%, rgba(0,0,0,0))`,
            transform: `rotate(-18deg) translateX(${Math.sin((2 * Math.PI * t) * 0.2) * width * 0.08}px)`,
            filter: 'blur(36px)',
          }}
        />
      </AbsoluteFill>

      {/* film grain using SVG turbulence */}
      <AbsoluteFill style={{opacity: grainOpacity, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id="ndgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#ndgrain)" />
        </svg>
      </AbsoluteFill>

      {/* soft vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.42) 100%)`,
        }}
      />

      {/* very subtle warm tint so overlays sit on a pleasing base */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${glow}14 0%, rgba(0,0,0,0) 60%)`}} />
    </AbsoluteFill>
  );
};
