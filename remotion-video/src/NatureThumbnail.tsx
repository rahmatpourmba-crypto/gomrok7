import React from 'react';
import {AbsoluteFill, staticFile, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fonts} from './visuals';

const GOLD = '#E8B360';
const GOLD_LIGHT = '#FFDE96';
const WHITE = '#FFFFFF';
const BGS = ['bg_mountains.jpg', 'bg_ocean.jpg', 'bg_stars.jpg'];

type Item = {
  code: string;
  surahName: string;
  surahEn: string;
  ayahNum: number;
  arabic: string;
  fa: string;
  en: string;
};

export const NatureThumbnail: React.FC<{items: Item[]; hook?: string}> = ({items, hook}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const f = items[0];
  const last = items[items.length - 1];
  const bg = BGS[(f.code.charCodeAt(0) || 0) % BGS.length];
  const glow = interpolate(frame, [0, 12], [0.5, 1], {extrapolateRight: 'clamp'});
  const hookText = (hook || (f.arabic?.split('\n')[0] || '…')).split(' ').slice(0, 5).join(' ');
  const faShort = (f.fa || '').split(' ').slice(0, 4).join(' ');
  const hlen = hookText.length;
  const hookSize = hlen <= 10 ? height * 0.17 : hlen <= 16 ? height * 0.135 : hlen <= 24 ? height * 0.105 : height * 0.082;

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      <Img src={staticFile(`/backgrounds/${bg}`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.6) brightness(1.6) contrast(1.15)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.02) 0%, rgba(5,7,12,0.1) 45%, rgba(5,7,12,0.3) 100%)'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(232,179,96,${0.42 * glow}) 0%, rgba(232,179,96,0) 58%)`}} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 3%'}}>
        <div style={{fontFamily: Fonts.sans, fontWeight: 700, fontSize: height * 0.035, color: '#FFE9C0', letterSpacing: 2, textAlign: 'center', marginTop: height * 0.025}}>
          تلاوت قرآن · آرامش 💛
        </div>

        <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: hookSize, color: '#FFFFFF', textAlign: 'center', direction: 'rtl', lineHeight: 1.55, marginTop: height * 0.015, filter: 'drop-shadow(0 0 22px rgba(255,200,90,0.9))', textShadow: '0 4px 14px rgba(0,0,0,0.55)'}}>
          {hookText}
        </div>

        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: height * 0.018}}>
          <div style={{width: width * 0.075, height: width * 0.075, borderRadius: '50%', background: 'rgba(232,179,96,0.3)', border: `2.5px solid ${GOLD}`, alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
            <div style={{width: 0, height: 0, borderLeft: width * 0.030, borderRight: 0, borderTop: width * 0.017, borderBottom: width * 0.017, borderLeftColor: '#FFF3D0', borderTopColor: 'transparent', borderBottomColor: 'transparent', marginLeft: 3}} />
          </div>
          <div style={{fontFamily: Fonts.sans, fontWeight: 900, fontSize: height * 0.065, color: '#FFFFFF', textAlign: 'center', textShadow: '0 3px 12px rgba(0,0,0,0.6), 0 0 28px rgba(232,179,96,0.5)'}}>
            {f.surahEn} {f.ayahNum}
          </div>
        </div>

        <div style={{width: width * 0.13, height: height * 0.008, background: '#FFD98E', borderRadius: 4, marginTop: height * 0.014}} />

        <div style={{fontFamily: Fonts.fa, fontWeight: 700, fontSize: height * 0.034, color: 'rgba(248,251,255,0.98)', textAlign: 'center', direction: 'rtl', marginTop: height * 0.012, lineHeight: 1.55, textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
          {faShort || ''}
        </div>

        <div style={{position: 'absolute', bottom: height * 0.03, fontFamily: Fonts.sans, fontWeight: 800, fontSize: height * 0.03, color: '#FFFFFF', background: 'rgba(232,179,96,0.28)', border: '1.5px solid #FFD98E', padding: '10px 28px', borderRadius: 40, letterSpacing: 1, textShadow: '0 1px 4px rgba(0,0,0,0.4)'}}>
          ⬇ اشتراک، لایک، آرامش 🌿
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
