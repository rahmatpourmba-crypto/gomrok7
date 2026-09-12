import React from 'react';
import {AbsoluteFill, interpolate, staticFile, OffthreadVideo, useCurrentFrame} from 'remotion';
import {CHANNEL} from './channel';
import {Fonts} from './visuals';
import {ayahs} from './data';
import {SURAH_AR, SURAH_EN, toFaDigits} from './triModel';

const AMBER = '#E8942A';
const AMBER_DARK = '#C46A12';
const INK = '#1C150A';
const RED = '#D3272B';
const NAVY = '#123B6B';

// نام سوره را به قرمز/آبی نفتی دوقرنگ می‌کنیم (همان تابع Thumbnail)
const splitSurah = (name: string): {a: string; b: string} => {
  const n = name.replace(':', '');
  const mid = Math.ceil(n.length / 2);
  return {a: n.slice(0, mid), b: n.slice(mid)};
};

const RECITERS_EN = 'DOSARI · SAQIR · TARIQ';
const WHATSAPP = '+98 914 168 8217';

const SoundWave: React.FC = () => (
  <svg width="70" height="58" viewBox="0 0 70 58" style={{display: 'block'}}>
    {[0, 12, 24, 36, 48].map((x, i) => (
      <rect key={x} x={x} y={29 - (10 + i * 6)} width="5" rx="2.5" height={20 + i * 12} fill="#1C150A" />
    ))}
  </svg>
);

const WaIcon: React.FC = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" style={{display: 'block'}}>
    <path fill="#FFFFFF" d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.7-1.2A10 10 0 1 0 12 2zm5.5 14.2c-.2.7-1.2 1.3-1.7 1.3-.5.1-1 .3-3.5-.7-3-1.3-4.9-4.4-5-4.6-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2c.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.6.6c-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.1.8-.1l1.1-1.3c.2-.3.4-.2.7-.1l2 .9c.3.2.5.3.6.4 0 .2 0 .8-.2 1.6z"/>
  </svg>
);
const IgIcon: React.FC = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" style={{display: 'block'}}>
    <path fill="#FFFFFF" d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6zm6.8-11.2a1.5 1.5 0 1 0 0 3.1 1.5 1.5 0 0 0 0-3.1z"/>
  </svg>
);
const FbIcon: React.FC = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" style={{display: 'block'}}>
    <path fill="#FFFFFF" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/>
  </svg>
);

const ContactBanner: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 152,
      background: `linear-gradient(90deg, ${AMBER_DARK}, ${AMBER})`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 46px',
      gap: 30,
      boxShadow: '0 -8px 30px rgba(0,0,0,0.45)',
    }}
  >
    <div
      style={{
        width: 96,
        height: 96,
        flex: '0 0 auto',
        background: '#FFFFFF',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 0 4px ' + AMBER,
      }}
    >
      <svg width="64" height="64" viewBox="0 0 100 100">
        <g fill="none" stroke="#1B3A6B" strokeWidth="7" strokeLinejoin="round">
          <rect x="24" y="24" width="52" height="52" rx="4" />
          <rect x="24" y="24" width="52" height="52" rx="4" transform="rotate(45 50 50)" strokeWidth="11" stroke="#C79A3B" />
        </g>
        <circle cx="50" cy="50" r="9" fill="#C79A3B" stroke="none" />
      </svg>
    </div>

    <div style={{flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 2}}>
      <div style={{fontFamily: Fonts.sans, fontWeight: 900, fontSize: 40, color: '#FFFFFF', letterSpacing: 1.5}}>
        {CHANNEL.name}
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 24, color: '#FFE9C0', letterSpacing: 1}}>
        DAILY QURAN • {CHANNEL.handle}
      </div>
    </div>

    <div style={{flex: '1 1 auto'}} />

    {[
      {icon: <WaIcon />, label: WHATSAPP},
      {icon: <IgIcon />, label: 'Instagram'},
      {icon: <FbIcon />, label: 'Facebook'},
    ].map((c) => (
      <div key={c.label} style={{display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap'}}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 13,
            background: 'rgba(0,0,0,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35)',
          }}
        >
          {c.icon}
        </div>
        <div style={{fontFamily: Fonts.sans, fontWeight: 700, fontSize: 22, color: '#FFFFFF', letterSpacing: 0.3}}>
          {c.label}
        </div>
      </div>
    ))}
  </div>
);

export const TriThumbnail: React.FC<{index?: number}> = ({index = 25}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 60], [1, 1.07], {extrapolateRight: 'clamp'});
  const ayah = ayahs[index] || ayahs[0];
  const surah = SURAH_EN[ayah.surah] ?? 'SURAH';
  const surahParts = splitSurah(surah);

  return (
    <AbsoluteFill style={{backgroundColor: '#0d0a05'}}>
      <OffthreadVideo
        src={staticFile('/backgrounds/bg_mountains.mp4')}
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${drift})`,
          filter: 'saturate(1.35) contrast(1.1) brightness(1.02) sepia(0.22) hue-rotate(-4deg)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(130% 100% at 20% 8%, rgba(255,205,130,0.5), rgba(255,150,60,0.22) 38%, rgba(5,5,10,0.42) 78%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(60% 45% at 22% 48%, rgba(255,244,222,0.66), rgba(255,244,222,0) 75%)',
        }}
      />

      {/* تیتر اصلی مرکز-چپ — سبک QUraan FM + سه‌زبانه (عربی/انگلیسی/فارسی) */}
      <div style={{position: 'absolute', left: 64, top: 150, display: 'flex', flexDirection: 'column'}}>
        {/* عربی */}
        <div
          style={{
            fontFamily: Fonts.quran,
            fontWeight: 700,
            fontSize: 66,
            lineHeight: 1,
            color: INK,
            direction: 'rtl',
            textShadow: '0 3px 0 rgba(255,255,255,0.5), 0 12px 26px rgba(0,0,0,0.35)',
            marginBottom: 10,
          }}
        >
          {SURAH_AR[ayah.surah] ?? 'القرآن'}
        </div>
        {/* انگلیسی — SURAH قرمز/آبی نفتی */}
        <div style={{fontFamily: Fonts.sans, fontWeight: 500, fontSize: 36, color: '#1A1207', letterSpacing: 12, textShadow: '0 2px 4px rgba(255,255,255,0.7)'}}>
          SURAH
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: 2}}>
          <div style={{display: 'flex', fontFamily: Fonts.sans, fontWeight: 900, fontSize: 118, lineHeight: 1, letterSpacing: 1, textShadow: '0 3px 0 rgba(255,255,255,0.5), 4px 6px 0 rgba(255,255,255,0.3), 0 14px 34px rgba(0,0,0,0.4)'}}>
            <span style={{color: RED}}>{surahParts.a}</span>
            <span style={{color: NAVY}}>{surahParts.b}:</span>
          </div>
          <div style={{marginBottom: 12}}>
            <SoundWave />
          </div>
        </div>
        {/* فارسی */}
        <div
          style={{
            fontFamily: Fonts.fa,
            fontWeight: 900,
            fontSize: 44,
            color: INK,
            direction: 'rtl',
            letterSpacing: 1,
            textShadow: '0 2px 5px rgba(255,255,255,0.7)',
            marginTop: 4,
          }}
        >
          سورهٔ {ayah.surah_name}
        </div>

        {/* قاریان — انگلیسی + عربی/فارسی */}
        <div style={{fontFamily: Fonts.sans, fontWeight: 700, fontSize: 28, color: '#241805', letterSpacing: 3, marginTop: 14, textShadow: '0 2px 4px rgba(255,255,255,0.65)'}}>
          {RECITERS_EN}
        </div>
        <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 30, color: '#241805', direction: 'rtl', marginTop: 2, textShadow: '0 2px 4px rgba(255,255,255,0.7)'}}>
          الدوسري · الصقير · طارق
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16}}>
          <div style={{width: 70, height: 5, background: AMBER, borderRadius: 3}} />
          <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 30, color: '#1A1207', letterSpacing: 3}}>
            AYAH {ayah.ayah} · آیهٔ {toFaDigits(ayah.ayah)}
          </div>
        </div>
      </div>

      <ContactBanner />
    </AbsoluteFill>
  );
};
