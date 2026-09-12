import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {Fonts} from './visuals';

const GOLD = '#E8B360';
const GOLD_LIGHT = '#FFDE96';
const WHITE = '#FFFFFF';

// همان آیهٔ انشراح ۵ و ۶
const AR = 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا\nإِنَّ مَعَ الْعُسْرِ يُسْرًا';
const FA = 'پس به‌راستی که با سختی، آسانی است. به‌راستی که با سختی، آسانی است.';
const EN = 'With hardship comes ease';

const RECITERS = [
  {audio: '/samples/tri_dosary.mp3', dur: 7.39, name: 'الدوسری', en: 'Al-Dosari'},
  {audio: '/samples/tri_ayyoub.mp3', dur: 10.71, name: 'محمد آیوب', en: 'Muhammad Ayyoub'},
  {audio: '/samples/tri_sudais.mp3', dur: 6.48, name: 'السدیس', en: 'As-Sudais'},
];

const GAP_FRAMES = 30; // 1 ثانیه فاصله بین هر قاری

const ReciterSegment: React.FC<{r: (typeof RECITERS)[number]}> = ({r}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, flexDirection: 'column', padding: '0 5%'}}>
      {/* نام قاری بالای صفحه */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{fontFamily: Fonts.fa, fontWeight: 900, fontSize: 52, color: WHITE, background: 'rgba(0,0,0,0.45)', border: `1px solid ${GOLD}`, padding: '12px 38px', borderRadius: 40}}>
          {r.name}
        </div>
        <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 26, color: GOLD_LIGHT}}>{r.en}</div>
      </div>

      {/* آیهٔ عربی */}
      <div style={{fontFamily: Fonts.quran, fontSize: 96, color: WHITE, textAlign: 'center', lineHeight: 1.6, direction: 'rtl', textShadow: '0 0 30px rgba(232,179,96,0.25)'}}>
        {AR.split('\n').map((ln, i) => (
          <div key={i}>{ln}</div>
        ))}
      </div>

      <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 34, color: GOLD_LIGHT, textAlign: 'center', direction: 'rtl', marginTop: 24, lineHeight: 1.7}}>
        {FA}
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 700, fontSize: 30, color: 'rgba(220,225,235,0.9)', marginTop: 8}}>
        {EN}
      </div>
    </AbsoluteFill>
  );
};

export const TriSample: React.FC = () => {
  const frame = useCurrentFrame();

  let cursor = 0;
  const starts = RECITERS.map((r) => {
    const s = cursor;
    cursor += Math.floor(r.dur * 30) + GAP_FRAMES;
    return s;
  });
  const total = cursor;

  const bg = {
    position: 'absolute' as const,
    left: '-40%',
    width: '380%',
    height: '100%',
    objectFit: 'cover' as const,
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      {RECITERS.map((r, i) => (
        <Sequence key={'bg' + i} from={starts[i]} durationInFrames={Math.floor(r.dur * 30) + GAP_FRAMES}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(`/backgrounds/${['bg_mountains.mp4', 'bg_ocean.mp4', 'bg_stars.mp4'][i % 3]}`)}
              muted
              style={bg}
            />
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.25), rgba(5,7,12,0.6))'}} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {RECITERS.map((r, i) => (
        <Sequence key={'seg' + i} from={starts[i]} durationInFrames={Math.floor(r.dur * 30) + GAP_FRAMES}>
          <ReciterSegment r={r} />
        </Sequence>
      ))}

      {RECITERS.map((r, i) => (
        <Sequence key={'aud' + i} from={starts[i]}>
          <Audio src={staticFile(r.audio)} />
        </Sequence>
      ))}

      {/* برچسب پایینی */}
      <div style={{position: 'absolute', bottom: '6%', left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: Fonts.fa, fontWeight: 700, fontSize: 24, color: 'rgba(214,222,236,0.85)'}}>انشراح ۵ و ۶ • یک آیه، سه قاری</div>
      </div>
    </AbsoluteFill>
  );
};
