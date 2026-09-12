import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {BgVideo, ReciterSegment, TriEndCard} from './triShared';

const FPS = 30;

const AR =
  'وَإِذَا رَأَوْا تِجَارَةً أَوْ لَهْوًا\nانْفَضُّوا إِلَيْهَا وَتَرَكُوكَ قَائِمًاۭ\nقُلْ مَا عِنْدَ اللَّهِ خَيْرٌ';

// ترجمهٔ فارسی کلمه‌به‌کلمه (همان نسخهٔ تأییدشده)
const FA_WORDS = [
  'و', 'چون', 'تجارت', 'یا', 'سرگرمی', 'ببینند،', 'به', 'آن', 'روی', 'آورند', 'و', 'تو', 'را',
  'ایستاده', 'رها', 'کنند.', 'بگو', 'آنچه', 'نزد', 'خداست', 'بهتر', 'است.',
];

const EN_TRANSLATION =
  'When they see some business or amusement, they scatter to it and leave you standing. Say: “What is with Allah is better than amusement and business.”';

const RECITERS = [
  {name: 'الدوسری', en: 'Al-Dosari', from: 0, dur: 22.1, bg: 'bg_mountains.mp4', bgDur: 15.8},
  {name: 'الصقیر', en: 'As-Saqir', from: (22.1 + 0.7) * FPS, dur: 26.1, bg: 'bg_ocean.mp4', bgDur: 20.9},
  {name: 'طارق محمد', en: 'Tariq Muhammad', from: (22.1 + 0.7 + 26.1 + 0.7) * FPS, dur: 30.5, bg: 'bg_stars.mp4', bgDur: 25.0},
];

const GAP_FRAMES = 21; // 0.7s

// کارت پایانی (تبلیغ کانال + دعوت به سابسکرایب/لایک/انتشار)
const END_FRAME = 2403; // بعد از اتمام صدای آیه
const END_DUR = 150; // 5 ثانیه
export const TRI_END = END_FRAME + END_DUR; // طول کل کمپوزیشن

export const TriJomah: React.FC = () => {
  const segDurs = RECITERS.map((r) => Math.floor(r.dur * FPS) + GAP_FRAMES);

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      {/* پس‌زمینهٔ متحرک هر بخش (ویدیوی لوپ‌شونده در سطح بالا) */}
      {RECITERS.map((r, i) => (
        <Sequence key={'bg' + i} from={r.from} durationInFrames={segDurs[i]}>
          <BgVideo bg={r.bg} bgDur={r.bgDur} durFrames={segDurs[i]} />
        </Sequence>
      ))}

      {/* محتوا */}
      {RECITERS.map((r, i) => (
        <Sequence key={'seg' + i} from={r.from} durationInFrames={segDurs[i]}>
          <ReciterSegment
            reciter={r}
            dur={r.dur}
            headerLabel="AL-JUMUAH 11"
            arabicLines={AR.split('\n')}
            faWords={FA_WORDS}
            enText={EN_TRANSLATION}
          />
        </Sequence>
      ))}

      <Audio src={staticFile('/jomah11_tri.mp3')} />

      {/* کارت پایانی: تبلیغ کانال + دعوت به سابسکرایب/لایک/انتشار */}
      <Sequence from={END_FRAME} durationInFrames={END_DUR}>
        <TriEndCard />
      </Sequence>
    </AbsoluteFill>
  );
};