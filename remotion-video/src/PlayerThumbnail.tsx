import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ayahs, cleanArabic} from './data';
import {Fonts} from './visuals';

const RED = '#E63B4A';
const BLUE = '#2F6CFF';
const INK = '#1E2430';
const SOFT = '#6B7280';

const SURAH_EN: Record<number, string> = {
  2: 'Al-Baqarah', 3: 'Aal Imran', 4: 'An-Nisa', 6: "Al-An'am", 8: 'Al-Anfal',
  9: 'At-Tawbah', 11: 'Hud', 13: "Ar-Ra'd", 17: 'Al-Isra', 18: 'Al-Kahf',
  20: 'Taha', 21: 'Al-Anbiya', 27: 'An-Naml', 29: 'Al-Ankabut', 32: 'As-Sajdah',
  34: 'Saba', 39: 'Az-Zumar', 40: 'Ghafir', 48: 'Al-Fath', 53: 'An-Najm',
  55: 'Ar-Rahman', 57: 'Al-Hadid', 62: "Al-Jumu'ah", 65: 'At-Talaq', 67: 'Al-Mulk',
  89: 'Al-Fajr', 93: 'Ad-Duha', 94: 'Ash-Sharh', 103: 'Al-Asr', 112: 'Al-Ikhlas',
  113: 'Al-Falaq',
};

export const PlayerThumbnail: React.FC<{index: number}> = ({index}) => {
  const ayah = ayahs[index] || ayahs[0];
  const arabic = cleanArabic(ayah.arabic);
  const enName = SURAH_EN[ayah.surah] || '';
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FDF3F4 50%, #F0F6FF 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* blobs */}
      <div style={{position: 'absolute', width: 700, height: 700, right: -280, top: -320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,59,74,0.12) 0%, rgba(230,59,74,0) 70%)'}} />
      <div style={{position: 'absolute', width: 700, height: 700, left: -280, bottom: -340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,108,255,0.12) 0%, rgba(47,108,255,0) 70%)'}} />

      {/* brand */}
      <div style={{position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(230,59,74,0.08)', border: '1px solid rgba(230,59,74,0.25)', borderRadius: 40, padding: '7px 16px'}}>
          <div style={{width: 10, height: 10, borderRadius: '50%', background: RED}} />
          <span style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 16, color: RED}}>راديو القرآن — QURAN FM</span>
        </div>
      </div>

      {/* surah + ayah */}
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 128, color: INK, lineHeight: 1.3}}>
          سُورَةُ {ayah.surah_name}
        </div>
        <div style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 700, fontSize: 40, color: BLUE, letterSpacing: 3, textTransform: 'uppercase', marginTop: 8}}>
          {enName} · Ayah {ayah.ayah}
        </div>
      </div>

      {/* arabic text */}
      <div style={{fontFamily: Fonts.quran, fontWeight: 700, fontSize: 52, color: RED, textAlign: 'center', direction: 'rtl', maxWidth: '80%', marginTop: 30, lineHeight: 1.8}}>
        {arabic}
      </div>

      {/* play button mini */}
      <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 58, height: 58, borderRadius: '50%', background: `linear-gradient(135deg, #FF5A68 0%, ${RED} 55%, #C22534 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(230,59,74,0.4)'}}>
            <div style={{width: 0, height: 0, marginLeft: 4, borderLeft: '16px solid #FFF', borderTop: '10px solid transparent', borderBottom: '10px solid transparent'}} />
          </div>
          <span style={{fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800, fontSize: 20, color: SOFT, letterSpacing: 1}}>بِصَوْتِهِ الآن</span>
        </div>
        <div style={{width: 58, height: 58, borderRadius: '50%', border: '3px solid rgba(47,108,255,0.35)', boxSizing: 'border-box'}} />
      </div>
    </AbsoluteFill>
  );
};