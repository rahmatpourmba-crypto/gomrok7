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
  AyahView,
  BrandPill,
  EndCard,
  Equalizer,
  FlowBar,
  FloatingDots,
  OpenCard,
  segFrames,
  SoftBlobs,
  startFrame,
} from './PlayerSegment';
import {SEG_OPEN, SEG_END} from './PlayerSegment';

export type DailyAyah = {
  code: string;
  surahName: string;
  surahEn: string;
  ayahNum: number;
  arabic: string;
  en: string;
};

const fallbackItem: DailyAyah = {
  code: '001001',
  surahName: 'ٱلْفَاتِحَةِ',
  surahEn: 'Al-Faatiha',
  ayahNum: 1,
  arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
};
const fallbackItemCode = '001001';

/* ── main: renders an arbitrary list of ayahs sequentially ── */
export const PlayerDaily: React.FC<{items: DailyAyah[]; durations: number[]}> = ({items, durations}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safeItems = items && items.length > 0 ? items : [fallbackItem];
  const safeDurs = durations && durations.length > 0 ? durations : [fallbackItemCode === safeItems[0].code ? 3.3 : 8];
  const codes = safeItems.map((it) => it.code);
  const durs =
    safeDurs && safeDurs.length === codes.length ? safeDurs : codes.map((c) => (c === '001001' ? 3.3 : 8));

  const bodyFrames = segFrames(durs, fps);
  const totalBody = SEG_OPEN + bodyFrames;
  const endFrom = totalBody;

  const bodyFrame = Math.max(0, frame - SEG_OPEN);
  let ayahIdx = 0;
  for (let i = 0; i < codes.length; i++) {
    const f = Math.max(6, Math.round(durs[i] * fps));
    if (bodyFrame >= f) ayahIdx = i + 1;
    else break;
  }
  ayahIdx = Math.min(ayahIdx, codes.length - 1);
  const localFrame = bodyFrame - startFrame(durs, ayahIdx, fps);

  const bodyOpacity = interpolate(frame, [SEG_OPEN, SEG_OPEN + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const isShort = safeItems.length === 1;
  const first = safeItems[0];
  const last = safeItems[safeItems.length - 1];
  const rangeTxt =
    first.ayahNum === last.ayahNum
      ? `${first.surahEn} · ${first.ayahNum}`
      : `${first.surahEn} · ${first.ayahNum}-${last.ayahNum}`;

  return (
    <AbsoluteFill style={{backgroundColor: '#FFFFFF'}}>
      <Sequence from={0} durationInFrames={totalBody} name="bg">
        <SoftBlobs />
        <FloatingDots count={26} />
      </Sequence>

      <Sequence from={0} durationInFrames={SEG_OPEN} name="open">
        <OpenCard surahName={first.surahName} rangeTxt={rangeTxt} />
      </Sequence>

      <Sequence from={SEG_OPEN} durationInFrames={bodyFrames} name="body">
        <AbsoluteFill style={{opacity: bodyOpacity}}>
          {safeItems.map((it, i) => {
            const start = startFrame(durs, i, fps);
            const len = Math.max(6, Math.round(durs[i] * fps));
            return (
              <Sequence key={it.code} from={start} durationInFrames={len}>
                <AyahView
                  surahName={it.surahName}
                  surahEn={it.surahEn}
                  ayahNum={it.ayahNum}
                  arabicText={it.arabic}
                  enText={it.en}
                  durSec={durs[i]}
                  localFrame={frame - SEG_OPEN - start}
                  showBasmala={it.ayahNum === 1}
                />
              </Sequence>
            );
          })}
        </AbsoluteFill>
        {!isShort && (
          <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40}}>
            <FlowBar idx={ayahIdx} total={safeItems.length} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence from={endFrom} durationInFrames={SEG_END} name="end">
        <EndCard />
      </Sequence>

      {safeItems.map((it, i) => {
        const start = SEG_OPEN + startFrame(durs, i, fps);
        const len = Math.max(6, Math.round(durs[i] * fps));
        return (
          <Sequence key={it.code + '_a'} from={start} durationInFrames={len}>
            <Audio src={staticFile(`tilawat/seg_${it.code}.mp3`)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export function dailyTotalFrames(durations: number[], fps: number): number {
  return SEG_OPEN + segFrames(durations, fps) + SEG_END;
}