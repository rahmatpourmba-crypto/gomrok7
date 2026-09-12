import React from 'react';
import {AbsoluteFill, interpolate, staticFile, OffthreadVideo, useCurrentFrame} from 'remotion';
import {Fonts} from './visuals';

const GOLD = '#E8B360';
const WHITE = '#FFFFFF';

export const ViralThumbnail: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 60], [1, 1.07], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#0d0a05'}}>
      <OffthreadVideo
        src={staticFile('/backgrounds/bg_mountains.mp4')}
        muted
        style={{
          position: 'absolute',
          left: '-40%',
          width: '380%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${drift})`,
          filter: 'saturate(1.3) contrast(1.1) brightness(1.03) sepia(0.2)',
        }}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.25), rgba(5,7,12,0.78))'}} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '56px'}}>
        <div style={{fontFamily: Fonts.fa, fontWeight: 400, fontSize: 64, color: '#FFE9C0', textAlign: 'center', lineHeight: 1.6, direction: 'rtl'}}>
          «فَإِنَّ مَعَ الْعُسْرِ يُسْرًا»
        </div>

        <div style={{width: 140, height: 6, background: GOLD, borderRadius: 3, margin: '34px 0'}} />

        <div style={{fontFamily: Fonts.sans, fontWeight: 900, fontSize: 150, color: WHITE, textAlign: 'center', lineHeight: 1.2}}>
          Anxiety?
          <br />
          heart heavy?
        </div>

        <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 72, color: GOLD, textAlign: 'center', marginTop: 30}}>
          with hardship comes EASE
        </div>

        <div style={{fontFamily: Fonts.sans, fontWeight: 700, fontSize: 44, color: 'rgba(255,255,255,0.92)', marginTop: 34, direction: 'rtl'}}>
          ۳ آیه برای آرامش قلب 🕊️
        </div>
      </AbsoluteFill>

      <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 40, color: '#FFE9C0', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(232,179,96,0.6)', padding: '14px 40px', borderRadius: 40}}>
          ✅ سه دقیقه گوش کن
        </div>
      </div>
    </AbsoluteFill>
  );
};
