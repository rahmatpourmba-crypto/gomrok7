import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CHANNEL} from './channel';
import {Fonts, ProceduralBackground} from './visuals';

const GOLD = '#E8B360';
const GOLD_LIGHT = '#FFDE96';
const WHITE = '#FFFFFF';

export const OPEN_FRAMES = 40;
export const END_FRAMES = 70;
const BACKEND_FRAMES = 12;

const BGS = ['bg_mountains.mp4', 'bg_ocean.mp4', 'bg_waterfall.mp4', 'bg_stars.mp4', 'bg_meadow.mp4', 'bg_sunset_clouds.mp4'];

type Item = {
  code: string;
  surahName: string;
  surahEn: string;
  ayahNum: number;
  arabic: string;
  fa: string;
  en: string;
};

export function natureTotalFrames(durations: number[], fps: number): number {
  let total = OPEN_FRAMES;
  for (const d of durations) total += Math.max(10, Math.round(d * fps)) + BACKEND_FRAMES;
  return total + END_FRAMES - BACKEND_FRAMES;
}

const kitburns = (frame: number, dur: number) => {
  const p = frame / Math.max(dur - 1, 1);
  const scale = 1 + 0.1 * p;
  return `scale(${scale}) translateY(${(1 - scale) * 50}%)`;
};

const splitEn = (en: string): string[] => {
  const clean = en.replace(/["“”'‘’]/g, '').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  return words.length > 16 ? [clean] : words;
};

const OpenCard: React.FC<{items: Item[]; hook?: string}> = ({items, hook}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, OPEN_FRAMES - 10, OPEN_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rise = interpolate(frame, [0, 16], [34, 0], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  const pop = interpolate(frame, [0, 22], [0.7, 1], {easing: Easing.out(Easing.back), extrapolateRight: 'clamp'});
  const f = items[0];
  const last = items[items.length - 1];
  const hookText = hook || f.surahName;
  const hookSmall = hookText.length > 26;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, transform: `translateY(${rise}px)`, flexDirection: 'column', padding: '0 7%'}}>
      <div style={{fontFamily: Fonts.sans, fontWeight: 400, fontSize: 34, color: GOLD_LIGHT, letterSpacing: 3}}>‌آرامش هر روز · تلاوت</div>
      <div style={{fontFamily: Fonts.quran, fontSize: hookSmall ? 68 : 104, color: WHITE, textAlign: 'center', direction: 'rtl', marginTop: 30, lineHeight: 1.5, filter: 'drop-shadow(0 0 26px rgba(232,179,96,0.8))', transform: `scale(${pop})`}}>
        {hookText}
      </div>
      <div style={{fontFamily: Fonts.fa, fontWeight: 600, fontSize: 40, color: WHITE, textAlign: 'center', marginTop: 26, opacity: interpolate(frame, [4, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        {f.surahName} · آیه {f.ayahNum}{last.ayahNum !== f.ayahNum ? ` تا ${last.ayahNum}` : ''}
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 500, fontSize: 28, color: GOLD_LIGHT, textAlign: 'center', marginTop: 12, opacity: interpolate(frame, [8, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        یاسر الدوسری
      </div>
      <div style={{width: 110, height: 4, background: GOLD, borderRadius: 2, marginTop: 24, transform: `scaleX(${interpolate(frame, [6, 22], [0, 1], {extrapolateRight: 'clamp'})})`}} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const punch = 1 + 0.04 * Math.sin((2 * Math.PI * frame) / 26);
  const qSlide = interpolate(frame, [10, 26], [40, 0], {easing: Easing.out(Easing.cubic), extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity, background: 'rgba(3,5,12,0.78)', flexDirection: 'column', padding: '0 8%'}}>
      <div style={{fontFamily: Fonts.quran, fontSize: 76, color: WHITE, textAlign: 'center', direction: 'rtl', textShadow: `0 0 30px ${GOLD}`}}>
        أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 900, fontSize: 92, color: WHITE, textAlign: 'center', lineHeight: 1.15, transform: `scale(${punch})`, marginTop: 22}}>
        Hearts find
        <br />
        peace <span style={{color: GOLD}}>in</span> Allah
      </div>
      <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 44, color: GOLD_LIGHT, textAlign: 'center', direction: 'rtl', marginTop: 30, transform: `translateY(${qSlide}px)`}}>
        کدام آیه قلبت را آرام میکند؟ 💛
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 28, color: 'rgba(214,222,236,0.75)', textAlign: 'center', marginTop: 18}}>کامنت کن تا بعدی را تقدیمت کنیم</div>
      <div style={{display: 'flex', flexDirection: 'row', gap: 20, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center'}}>
        <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 30, color: WHITE, background: 'rgba(232,179,96,0.16)', border: '1px solid rgba(232,179,96,0.6)', padding: '12px 28px', borderRadius: 40}}>⬇ subscribe</div>
        <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 30, color: WHITE, background: 'rgba(232,179,96,0.16)', border: '1px solid rgba(232,179,96,0.6)', padding: '12px 28px', borderRadius: 40}}>⭐ share</div>
      </div>
      <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 24, color: 'rgba(214,222,236,0.7)', marginTop: 16}}>{CHANNEL.handle}</div>
    </AbsoluteFill>
  );
};

const VerseSegment: React.FC<{item: Item; dur: number}> = ({item, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const opacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const words = splitEn(item.en);
  const isWordMode = words.length > 1;
  const per = dur / Math.max(words.length, 1);
  const active = Math.min(Math.max(Math.floor(t / per), -1), words.length - 1);
  const faSmall = (item.fa || '').length > 110;
  const wh = Math.max(24, Math.min(64, Math.floor(300 / words.length)));

  return (
    <AbsoluteFill style={{opacity, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '0 5%'}}>
      <div style={{width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: Fonts.quran, fontSize: faSmall ? 78 : 92, color: WHITE, textAlign: 'center', lineHeight: 1.7, direction: 'rtl', filter: 'drop-shadow(0 0 18px rgba(232,179,96,0.65))'}}>
          {item.arabic || '…'}
        </div>
      </div>

      {isWordMode ? (
        <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '96%', marginTop: 26}}>
          {words.map((w, i) => {
            const isActive = i <= active;
            const isPeak = i === active;
            return (
              <span key={i} style={{
                fontFamily: Fonts.sans, fontWeight: 900, fontSize: isPeak ? wh + 14 : wh,
                color: isPeak ? WHITE : isActive ? GOLD_LIGHT : 'rgba(215,222,235,0.35)',
                textShadow: isPeak ? `0 0 24px ${GOLD}` : 'none',
                margin: '0 6px', opacity: isActive ? 1 : 0.3,
                transform: `translateY(${isPeak ? -7 : 0}px)`,
              }}>{w}</span>
            );
          })}
        </div>
      ) : (
        <div style={{fontFamily: Fonts.sans, fontWeight: 800, fontSize: 40, color: GOLD_LIGHT, textAlign: 'center', marginTop: 24, textShadow: '0 0 22px rgba(232,179,96,0.4)'}}>
          {item.en}
        </div>
      )}

      <div style={{fontFamily: Fonts.fa, fontWeight: 600, fontSize: faSmall ? 30 : 36, color: 'rgba(235,240,247,0.95)', textAlign: 'center', lineHeight: 1.7, direction: 'rtl', marginTop: 20, maxWidth: '96%'}}>
        {item.fa || ''}
      </div>

      <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 26, color: GOLD_LIGHT, marginTop: 18, opacity: 0.9}}>
        {item.surahEn} {item.ayahNum}
      </div>
    </AbsoluteFill>
  );
};

export const NatureDaily: React.FC<{items: Item[]; durations: number[]; hook?: string; bg?: 'video' | 'procedural'}> = ({items, durations, hook, bg = 'procedural'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ds = items.map((_, i) => Math.max(10, Math.round((durations[i] ?? 16) * fps)) + BACKEND_FRAMES);
  const starts: number[] = [];
  let cursor = OPEN_FRAMES;
  for (let i = 0; i < items.length; i++) {
    starts.push(cursor);
    cursor += ds[i];
  }
  const totalFrames = cursor + END_FRAMES - BACKEND_FRAMES;

  return (
    <AbsoluteFill style={{backgroundColor: '#05070c'}}>
      {items.map((it, i) => (
        <Sequence key={i} from={i === 0 ? 0 : starts[i]} durationInFrames={ds[i] + (i === items.length - 1 ? END_FRAMES : 0)}>
          <AbsoluteFill>
            {bg === 'procedural' ? (
              <ProceduralBackground index={i + (it.code.charCodeAt(0) || 0)} />
            ) : (
              <OffthreadVideo
                src={staticFile(`/backgrounds/${BGS[(i + (it.code.charCodeAt(0) || 0)) % BGS.length]}`)}
                muted
                style={{position: 'absolute', left: '-60%', width: '420%', height: '100%', objectFit: 'cover', filter: 'saturate(1.35) brightness(1.3) contrast(1.08)', transform: kitburns(i === 0 ? frame : Math.max(frame - starts[i], 0), ds[i])}}
              />
            )}
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,12,0.12), rgba(5,7,12,0.38))'}} />
            <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, rgba(232,179,96,0.16) 0%, rgba(232,179,96,0) 58%)'}} />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={OPEN_FRAMES} name="open">
        <OpenCard items={items} hook={hook} />
      </Sequence>

      {items.map((it, i) => (
        <Sequence key={'v' + i} from={starts[i]} durationInFrames={ds[i]} name={'verse' + i}>
          <VerseSegment item={it} dur={durations[i] ?? 16} />
        </Sequence>
      ))}

      <Sequence from={starts[items.length - 1] + ds[items.length - 1] - BACKEND_FRAMES} durationInFrames={END_FRAMES} name="end">
        <EndCard />
      </Sequence>

      {items.map((it, i) => (
        <Sequence key={'a' + i} from={starts[i]}>
          <Audio src={staticFile(`/tilawat/seg_${it.code}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
