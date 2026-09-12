import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {Fonts} from './visuals';
import {CHANNEL} from './channel';
import {FPS} from './triModel';

export const GOLD = '#E8942A';
export const GOLD_LIGHT = '#FFDE96';
export const WHITE = '#FFFFFF';
export const INK = '#1F1608';

// حرکت نرم (Ken Burns) روی پس‌زمینه — frame داخل Sequence نسبی است
export const kitburns = (frame: number, durFrames: number) => {
  const p = frame / Math.max(durFrames - 1, 1);
  const scale = 1.18 + 0.12 * p;
  const x = (1 - scale) * 50 + 8 * Math.sin(p * Math.PI * 2);
  return `scale(${scale}) translateX(${x}%) translateY(${(1 - scale) * 45}%)`;
};

export const BgVideo: React.FC<{
  bg: string;
  bgDur: number;
  durFrames: number;
}> = ({bg, bgDur, durFrames}) => {
  const frame = useCurrentFrame();
  const videoFrames = Math.round(bgDur * FPS);
  const passes = Math.ceil(durFrames / videoFrames) + 1;
  return (
    <>
      {Array.from({length: passes}).map((_, k) => (
        <Sequence key={k} from={k * videoFrames} durationInFrames={videoFrames}>
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(`/backgrounds/${bg}`)}
              muted
              style={{
                position: 'absolute',
                left: '-40%',
                width: '380%',
                height: '100%',
                objectFit: 'cover',
                transform: kitburns(frame, durFrames),
              }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(5,7,12,0.22), rgba(5,7,12,0.6))',
        }}
      />
    </>
  );
};

// هایلایت کلمه‌به‌کلمهٔ فارسی (توزیع یکنواخت روی مدت هر قاری — همان الگوریتم تأییدشده)
export const WordHighlight: React.FC<{words: string[]; dur: number}> = ({
  words,
  dur,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const per = dur / Math.max(words.length, 1);
  const active = Math.min(Math.floor(t / per), words.length - 1);
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'center',
        maxWidth: '92%',
        direction: 'rtl',
        fontSize: 40,
        lineHeight: 1.75,
      }}
    >
      {words.map((w, i) => {
        const isActive = i <= active;
        const isPeak = i === active;
        return (
          <span
            key={i}
            style={{
              fontFamily: Fonts.fa,
              fontWeight: 800,
              fontSize: isPeak ? 46 : 40,
              color: isPeak ? WHITE : isActive ? GOLD_LIGHT : 'rgba(220,225,235,0.3)',
              textShadow: isPeak ? `0 0 26px ${GOLD}` : 'none',
              margin: '0 4px',
              opacity: isActive ? 1 : 0.32,
              transform: `translateY(${isPeak ? -6 : 0}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// متن عربی — با سایز تطبیقی تا برای آیات طولانی هم جا شود
export const ArabicBlock: React.FC<{lines: string[]}> = ({lines}) => {
  const totalWords = lines.join(' ').split(/\s+/).filter(Boolean).length;
  const fontSize = Math.max(36, 62 - Math.max(0, totalWords - 14) * 1.4);
  return (
    <div
      style={{
        fontFamily: Fonts.quran,
        fontSize,
        color: WHITE,
        textAlign: 'center',
        lineHeight: 1.65,
        direction: 'rtl',
        textShadow: '0 0 34px rgba(232,179,96,0.3)',
      }}
    >
      {lines.map((ln, i) => (
        <div key={i}>{ln}</div>
      ))}
    </div>
  );
};

export const ReciterSegment: React.FC<{
  reciter: {name: string; en: string};
  dur: number;
  headerLabel: string;
  arabicLines: string[];
  faWords: string[];
  enText: string;
}> = ({reciter, dur, headerLabel, arabicLines, faWords, enText}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity}}>
      {/* سرصفحهٔ نام قاری + مشخصات سوره */}
      <div
        style={{
          position: 'absolute',
          top: '7%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: Fonts.fa,
            fontWeight: 900,
            fontSize: 48,
            color: INK,
            background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
            border: '1px solid #fff',
            padding: '10px 34px',
            borderRadius: 38,
            boxShadow: '0 8px 26px rgba(0,0,0,0.35)',
          }}
        >
          {reciter.name}
        </div>
        <div
          style={{
            fontFamily: Fonts.sans,
            fontWeight: 700,
            fontSize: 24,
            color: GOLD_LIGHT,
            letterSpacing: 2,
          }}
        >
          {reciter.en}
        </div>
        <div
          style={{
            fontFamily: Fonts.sans,
            fontWeight: 800,
            fontSize: 26,
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: 6,
          }}
        >
          {headerLabel}
        </div>
      </div>

      {/* آیهٔ عربی */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 4%',
        }}
      >
        <ArabicBlock lines={arabicLines} />
      </div>

      {/* پایین: فارسی (کلمه‌به‌کلمه) + انگلیسی + نام قاری */}
      <div
        style={{
          position: 'absolute',
          bottom: '4%',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 4%',
          gap: 16,
        }}
      >
        <div
          style={{
            background: 'rgba(5,7,12,0.42)',
            borderRadius: 30,
            padding: '20px 26px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            maxWidth: '96%',
          }}
        >
          <WordHighlight words={faWords} dur={dur} />
          <div
            style={{
              fontFamily: Fonts.sans,
              fontWeight: 600,
              fontSize: 30,
              color: 'rgba(255,255,255,0.95)',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: '94%',
            }}
          >
            {enText}
          </div>
        </div>
        <div
          style={{
            fontFamily: Fonts.fa,
            fontWeight: 800,
            fontSize: 30,
            color: GOLD_LIGHT,
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(232,179,96,0.5)',
            padding: '8px 24px',
            borderRadius: 32,
          }}
        >
          {reciter.name} · {reciter.en}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// کارت پایانی — تبلیغ کانال + دعوت به سابسکرایب/لایک/انتشار (عربی/فارسی/انگلیسی)
export const TriEndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const pulse = 1 + 0.035 * Math.sin((2 * Math.PI * frame) / 26);
  const rise = interpolate(frame, [0, 30], [26, 0], {extrapolateRight: 'clamp'});

  const socials = [
    {fa: 'واتس‌اپ', ar: 'واتساب', en: 'WhatsApp', color: '#25D366', sub: '+98 914 168 8217'},
    {fa: 'اینستاگرام', ar: 'إنستغرام', en: 'Instagram', color: '#E1306C', sub: '@islamrazekhoshabkhte'},
    {fa: 'فیس‌بوک', ar: 'فيسبوك', en: 'Facebook', color: '#1877F2', sub: 'آیه آرامش'},
  ];

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${rise}px)`,
        background: 'radial-gradient(130% 120% at 50% 18%, #16314f 0%, #0a0e18 62%)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '0 6%',
      }}
    >
      {/* نشان کانال */}
      <div
        style={{
          width: 140,
          height: 140,
          flex: '0 0 auto',
          background: '#FFFFFF',
          borderRadius: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 14px 46px rgba(0,0,0,0.55), inset 0 0 0 4px ' + GOLD,
          marginBottom: 26,
        }}
      >
        <svg width="98" height="98" viewBox="0 0 100 100">
          <g fill="none" stroke="#1B3A6B" strokeWidth="7" strokeLinejoin="round">
            <rect x="24" y="24" width="52" height="52" rx="4" />
            <rect
              x="24"
              y="24"
              width="52"
              height="52"
              rx="4"
              transform="rotate(45 50 50)"
              strokeWidth="11"
              stroke="#C79A3B"
            />
          </g>
          <circle cx="50" cy="50" r="9" fill="#C79A3B" stroke="none" />
        </svg>
      </div>

      {/* نام کانال — فارسی + عربی + انگلیسی */}
      <div style={{fontFamily: Fonts.fa, fontWeight: 900, fontSize: 64, color: WHITE}}>
        {CHANNEL.name}
      </div>
      <div
        style={{
          fontFamily: Fonts.quran,
          fontWeight: 700,
          fontSize: 34,
          color: GOLD_LIGHT,
          marginTop: 4,
          direction: 'rtl',
        }}
      >
        آية آرامش
      </div>
      <div
        style={{
          fontFamily: Fonts.sans,
          fontWeight: 800,
          fontSize: 24,
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: 4,
          marginTop: 6,
        }}
      >
        AYEH ARAMESH
      </div>

      {/* شعار سه‌زبانه */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          marginTop: 18,
          border: '1px solid rgba(232,179,96,0.4)',
          borderRadius: 22,
          padding: '14px 26px',
          background: 'rgba(232,179,96,0.08)',
        }}
      >
        <div
          style={{
            fontFamily: Fonts.quran,
            fontWeight: 700,
            fontSize: 30,
            color: WHITE,
            direction: 'rtl',
          }}
        >
          آية كل يوم
        </div>
        <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 32, color: GOLD_LIGHT}}>
          هر روز یک آیهٔ آرامش
        </div>
        <div
          style={{
            fontFamily: Fonts.sans,
            fontWeight: 700,
            fontSize: 22,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: 3,
          }}
        >
          A VERSE EVERY DAY
        </div>
      </div>

      {/* دعوت به سابسکرایب/لایک/انتشار — سه‌زبانه */}
      <div
        style={{
          display: 'flex',
          gap: 18,
          marginTop: 30,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[
          {fa: 'سابسکرایب کن', ar: 'اشترك', en: 'SUBSCRIBE', icon: '🔔', bg: GOLD},
          {fa: 'لایک کن', ar: 'أعجبني', en: 'LIKE', icon: '👍', bg: '#E1306C'},
          {fa: 'انتشار بده', ar: 'انشر', en: 'SHARE', icon: '📤', bg: '#25D366'},
        ].map((c) => (
          <div
            key={c.en}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.28)',
              borderRadius: 20,
              padding: '14px 20px',
              transform: `scale(${pulse})`,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 15,
                background: c.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
              }}
            >
              {c.icon}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}>
              <div style={{fontFamily: Fonts.fa, fontWeight: 900, fontSize: 32, color: WHITE}}>
                {c.fa}
              </div>
              <div
                style={{
                  fontFamily: Fonts.quran,
                  fontWeight: 700,
                  fontSize: 26,
                  color: GOLD_LIGHT,
                  direction: 'rtl',
                }}
              >
                {c.ar}
              </div>
              <div
                style={{
                  fontFamily: Fonts.sans,
                  fontWeight: 800,
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: 3,
                }}
              >
                {c.en}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* تبلیغ شبکه‌های اجتماعی */}
      <div style={{width: '100%', marginTop: 32, textAlign: 'center'}}>
        <div
          style={{
            fontFamily: Fonts.quran,
            fontWeight: 700,
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            direction: 'rtl',
          }}
        >
          تابعونا وانشروا
        </div>
        <div style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.9)'}}>
          ما را دنبال کنید و منتشر کنید
        </div>
        <div
          style={{
            fontFamily: Fonts.sans,
            fontWeight: 700,
            fontSize: 22,
            color: 'rgba(232,179,96,0.95)',
            letterSpacing: 3,
            marginTop: 2,
          }}
        >
          FOLLOW &amp; SHARE
        </div>
        <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20}}>
          {socials.map((s) => (
            <div
              key={s.en}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.22)',
                padding: '10px 18px',
                borderRadius: 40,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                {s.en[0]}
              </div>
              <div style={{textAlign: 'left'}}>
                <div style={{display: 'flex', gap: 8, alignItems: 'baseline'}}>
                  <span style={{fontFamily: Fonts.fa, fontWeight: 800, fontSize: 24, color: WHITE}}>
                    {s.fa}
                  </span>
                  <span
                    style={{
                      fontFamily: Fonts.quran,
                      fontWeight: 700,
                      fontSize: 20,
                      color: GOLD_LIGHT,
                      direction: 'rtl',
                    }}
                  >
                    {s.ar}
                  </span>
                </div>
                <div style={{fontFamily: Fonts.sans, fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,0.7)'}}>
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};