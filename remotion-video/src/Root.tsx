import React from 'react';
import {Composition} from 'remotion';
import {QuranShorts, SHORTS_OPEN, SHORTS_END} from './QuranShorts';
import {CinematicDoc, DOC_OPEN, DOC_END} from './CinematicDoc';
import {TextTemplate, TT_OPEN, TT_END} from './TextTemplate';
import {Thumbnail} from './Thumbnail';
import {ayahDuration, durationsForIndex} from './data';
import {CustomsQuestion, cqTiming} from './CustomsQuestion';
import {ViralShorts} from './ViralShorts';
import {ViralThumbnail} from './ViralThumbnail';
import {TriSample} from './TriSample';
import {TriThumbnail} from './TriThumbnail';
import {TriJomah, TRI_END} from './TriJomah';
import {TriAyah} from './TriAyah';
import {PlayerShort} from './PlayerShort';
import {PlayerThumbnail} from './PlayerThumbnail';
import {PlayerSegment, segmentTotalFrames} from './PlayerSegment';
import {PlayerDaily, dailyTotalFrames} from './PlayerDaily';
import {PlayerThumbnailDaily} from './PlayerThumbnailDaily';
import {NatureDaily, natureTotalFrames} from './NatureDaily';
import {NatureThumbnail} from './NatureThumbnail';
import {TrendThumbnail} from './TrendThumbnail';
import {triTotalFrames} from './triModel';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        durationInFrames={30}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{index: 0}}
      />
      <Composition
        id="QuranShorts"
        component={QuranShorts}
        durationInFrames={30 * 30}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{index: 0}}
        calculateMetadata={async ({props}) => ({
          durationInFrames:
            SHORTS_OPEN + Math.ceil(ayahDuration(props.index) * FPS) + 18 + SHORTS_END,
        })}
      />
      <Composition
        id="CinematicDoc"
        component={CinematicDoc}
        durationInFrames={30 * 26}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{index: 0}}
        calculateMetadata={async ({props}) => ({
          durationInFrames:
            DOC_OPEN + Math.ceil(ayahDuration(props.index) * FPS) + 24 + DOC_END,
        })}
      />
      <Composition
        id="TextTemplate"
        component={TextTemplate}
        durationInFrames={30 * 24}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{index: 0}}
        calculateMetadata={async ({props}) => ({
          durationInFrames:
            TT_OPEN + Math.ceil(ayahDuration(props.index) * FPS) + 24 + TT_END,
        })}
      />
      <Composition
        id="ViralShorts"
        component={ViralShorts}
        durationInFrames={30 * 30}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{index: 0}}
        calculateMetadata={async () => ({
          durationInFrames: 1339,
        })}
      />
      <Composition
        id="ViralThumbnail"
        component={ViralThumbnail}
        durationInFrames={30}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="TriSample"
        component={TriSample}
        durationInFrames={826}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="TriThumbnail"
        component={TriThumbnail}
        durationInFrames={30}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{index: 25}}
      />
      <Composition
        id="TriJomah"
        component={TriJomah}
        durationInFrames={TRI_END}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      <Composition
        id="TriAyah"
        component={TriAyah}
        durationInFrames={triTotalFrames(25)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{index: 25}}
        calculateMetadata={async ({props}) => ({
          durationInFrames: triTotalFrames(props.index),
        })}
      />
      <Composition
        id="PlayerShort"
        component={PlayerShort}
        durationInFrames={900}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{index: 0}}
        calculateMetadata={async ({props}) => ({
          durationInFrames: 40 + Math.ceil((durationsForIndex[props.index] ?? 20) * FPS) + 18 + 90,
        })}
      />
      <Composition
        id="PlayerSegment"
        component={PlayerSegment}
        durationInFrames={900}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{seg: 0, durations: [8, 8, 8, 8, 8, 8, 8]}}
        calculateMetadata={async ({props}) => ({
          durationInFrames: segmentTotalFrames(props.durations, FPS),
        })}
      />
      <Composition
        id="PlayerDaily"
        component={PlayerDaily}
        durationInFrames={900}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{items: [], durations: []}}
        calculateMetadata={async ({props}) => ({
          durationInFrames: dailyTotalFrames(props.durations, FPS),
        })}
      />
      <Composition
        id="PlayerThumbnailDaily"
        component={PlayerThumbnailDaily}
        durationInFrames={30}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{items: []}}
      />
      <Composition
        id="NatureDaily"
        component={NatureDaily}
        durationInFrames={900}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{items: [], durations: []}}
        calculateMetadata={async ({props}) => ({
          durationInFrames: natureTotalFrames(props.durations, FPS),
        })}
      />
      <Composition
        id="NatureLong"
        component={NatureDaily}
        durationInFrames={natureTotalFrames([10, 10, 10], 24)}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{items: [], durations: [], bg: 'procedural'}}
        calculateMetadata={async ({props}) => ({
          durationInFrames: natureTotalFrames(props.durations, 24),
        })}
      />
      <Composition
        id="NatureThumbnail"
        component={NatureThumbnail}
        durationInFrames={30}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{items: []}}
      />
      <Composition
        id="TrendThumbnail"
        component={TrendThumbnail}
        durationInFrames={30}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{}}
      />
      <Composition
        id="PlayerThumbnail"
        component={PlayerThumbnail}
        durationInFrames={30}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{index: 0}}
      />
      <Composition
        id="CustomsQuestion"
        component={CustomsQuestion}
        durationInFrames={cqTiming({
          num: 249,
          question: '',
          options: ['', '', '', ''],
          correct: 1,
          reason: '',
          audio: {q: 12.22, o1: 7.44, o2: 4.82, o3: 5.28, o4: 5.04, a: 8.66, r: 13.97},
        }).end}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          q: {
            num: 249,
            question: 'در هر یک از گمرک‌های مبدأ و مقصد، طبق تبصره ۱ ماده ۱۸۲، باید چه اطلاعاتی را نگهداری کند؟',
            options: [
              'اطلاعات مربوط به کالای ترانزیتی و ثبت ورود و خروج کالا',
              'اطلاعات مالی صاحب کالا',
              'اسناد مالکیت وسیله نقلیه',
              'یک نسخه از بارنامه حمل',
            ],
            correct: 1,
            reason:
              'طبق تبصره ۱ ماده ۱۸۲ قانون امور گمرکی، هر یک از گمرک‌های مبدأ و مقصد باید اطلاعات مربوط به کالای ترانزیتی و ثبت ورود و خروج کالا را نگهداری کند.',
            audio: {q: 12.22, o1: 7.44, o2: 4.82, o3: 5.28, o4: 5.04, a: 8.66, r: 13.97},
          },
        }}
        calculateMetadata={({props}) => {
          return {durationInFrames: cqTiming(props.q).end};
        }}
      />
    </>
  );
};
