import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts} from './visuals';
import type {DailyAyah} from './PlayerDaily';

const RED = '#E63B4A';
const BLUE = '#2F6CFF';
const GREEN = '#0EA86B';
const GREEN_DEEP = '#0A7F51';
const INK = '#1E2430';
const SOFT = '#6B7280';

const fallback: DailyAyah = {
  code: '001001',
  surahName: 'ٱلْفَاتِحَةِ',
  surahEn: 'Al-Faatiha',
  ayahNum: 1,
  arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
};

export const PlayerThumbnailDaily: React.FC<{items: DailyAyah[]}> = ({items}) => {
  const safe = items && items.length > 0 ? items : [fallback];
  const first = safe[0];
  const last = safe[safe.length - 1];
  const isShort = safe.length === 1;
  const rangeTxt = isShort
    ? `${first.surahEn} · Ayah ${first.ayahNum}`
    : `${first.surahEn} · Ayahs ${first.ayahNum}-${last.ayahNum}`;
  const arabic = isShort ? first.arabic : (safe[0].arabic.split(/\s+/).slice(0, 10).join(' ') + ' …');
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F4FBF7 50%, #EFF5FF 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', width: 760, height: 760, right: -280, top: -320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,59,74,0.13) 0%, rgba(230,59,74,0) 70%)'}} />
      <div style={{position: 'absolute', width: 760, height: 760, left: -280, bottom: -340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,108,255,0.13) 0%, rgba(47,108,255,0) 70%)'}} />
      <div style={{position: 'absolute', width: 560, height: 560, right: '8%', top: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,168,107,0.12) 0%, rgba(14,168,107,0) 70%)'}} />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'linear-gradient(90deg, transparent, #E63B4A 25%, #0EA86B 50%, #2F6CFF 75%, transparent)'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: 'linear-gradient(90deg, transparent, #2F6CFF 25%, #0EA86B 50%, #E63B4A 75%, transparent)'}} />

      <div style={{position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(230,59,74,0.08)', border: '1px solid rgba(230,59,74,0.25)', borderRadius: 40, padding: '7px 16px'}}>
          <div style={{width: 10, height: 10, borderRadius: '50%', background: RED}} />
          <span style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 16, color: RED}}>راديو القرآن — QURAN FM</span>
        </div>
      </div>

      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 120, color: INK, lineHeight: 1.3}}>
          سُورَةُ {first.surahName}
        </div>
        <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 700, fontSize: 40, color: GREEN_DEEP, letterSpacing: 3, textTransform: 'uppercase', marginTop: 8}}>
          {rangeTxt}
        </div>
      </div>

      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 44, color: INK, textAlign: 'center', direction: 'rtl', maxWidth: '82%', marginTop: 26, lineHeight: 1.9}}>
        {arabic}
      </div>

      <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 58, height: 58, borderRadius: '50%', background: `linear-gradient(135deg, #FF5A68 0%, ${RED} 55%, #C22534 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(230,59,74,0.4)'}}>
            <div style={{width: 0, height: 0, marginLeft: 4, borderLeft: '16px solid #FFF', borderTop: '10px solid transparent', borderBottom: '10px solid transparent'}} />
          </div>
          <span style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 20, color: SOFT, letterSpacing: 1}}>بِصَوْتِهِ الآن</span>
        </div>
        <div style={{width: 58, height: 58, borderRadius: '50%', border: '3px solid rgba(14,168,107,0.4)', boxSizing: 'border-box'}} />
      </div>
    </AbsoluteFill>
  );
};