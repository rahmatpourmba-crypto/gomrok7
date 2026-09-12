import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {ayahs, cleanArabic, wordsOf} from './data';
import {BgVideo, ReciterSegment, TriEndCard} from './triShared';
import {
  SURAH_EN,
  TRI_END_CARD_DUR,
  toFaDigits,
  triLayout,
  triRecitersForIndex,
  triSpecForIndex,
  triTimingForIndex,
} from './triModel';

// برای آیات بلند، متن عربی در خطوط حداکثر ۶ کلمه‌ای شکسته می‌شود
const wrapArabic = (text: string): string[] => {
  if (text.includes('\n')) return text.split('\n');
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 6) {
    lines.push(words.slice(i, i + 6).join(' '));
  }
  return lines;
};

export const TriAyah: React.FC<{index: number}> = ({index}) => {
  const ayah = ayahs[index] || ayahs[0];
  const timing = triTimingForIndex(index);
  const spec = triSpecForIndex(index);

  if (!timing) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#05070c',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontFamily: 'sans-serif',
          fontSize: 40,
        }}
      >
        no tri-audio for index {index}
      </AbsoluteFill>
    );
  }

  const reciters = triRecitersForIndex(index);
  const layout = triLayout(timing);
  const total = layout[layout.length - 1].from + layout[layout.length - 1].dur;

  const label =
    spec?.label ??
    `${SURAH_EN[ayah.surah] ?? 'SURAH'} ${ayah.ayah} · ${toFaDigits(ayah.ayah)}`;
  const arabicLines = wrapArabic(spec?.arabic ?? cleanArabic(ayah.arabic));
  const faWords = wordsOf(spec?.fa ?? ayah.fa);
  const enText = spec?.en ?? ayah.en ?? '';

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      {/* پس‌زمینهٔ متحرک هر بخش */}
      {reciters.map((r, i) => (
        <Sequence key={'bg' + i} from={layout[i].from} durationInFrames={layout[i].dur}>
          <BgVideo bg={r.bg} bgDur={r.bgDur} durFrames={layout[i].dur} />
        </Sequence>
      ))}

      {/* محتوا */}
      {reciters.map((r, i) => (
        <Sequence key={'seg' + i} from={layout[i].from} durationInFrames={layout[i].dur}>
          <ReciterSegment
            reciter={r}
            dur={r.dur}
            headerLabel={label}
            arabicLines={arabicLines}
            faWords={faWords}
            enText={enText}
          />
        </Sequence>
      ))}

      <Audio src={staticFile(timing.audio)} />

      {/* کارت پایانی */}
      <Sequence from={total} durationInFrames={TRI_END_CARD_DUR}>
        <TriEndCard />
      </Sequence>
    </AbsoluteFill>
  );
};