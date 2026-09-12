import triAudio from './tri_audio.json';

export const FPS = 30;

export type TriReciter = {
  name: string;
  en: string;
  bg: string;
  bgDur: number;
};

export type TriSpec = {
  label?: string;
  arabic?: string;
  fa?: string;
  en?: string;
  reciters: TriReciter[];
};

export type TriTiming = {
  audio: string;
  gap: number;
  segs: number[];
  ref: string;
};

export const DEFAULT_TRIPLE: TriReciter[] = [
  {name: 'الدوسری', en: 'Al-Dosari', bg: 'bg_mountains.mp4', bgDur: 15.8},
  {name: 'الصقیر', en: 'As-Saqir', bg: 'bg_ocean.mp4', bgDur: 20.9},
  {name: 'طارق محمد', en: 'Tariq Muhammad', bg: 'bg_stars.mp4', bgDur: 25.0},
];

// نام‌های لاتین و عربی سوره‌های موجود در دیتاست (۵۳ آیه)
export const SURAH_EN: Record<number, string> = {
  2: 'AL-BAQARAH', 3: "AAL-IMRAN", 4: 'AN-NISA', 6: "AL-AN'AM", 8: 'AL-ANFAL',
  9: 'AT-TAWBAH', 11: 'HUD', 13: "AR-RA'D", 17: 'AL-ISRA', 18: 'AL-KAHF',
  20: 'TA-HA', 21: 'AL-ANBIYA', 27: 'AN-NAML', 29: "AL-'ANKABUT",
  32: 'AS-SAJDAH', 34: 'SABA', 39: 'AZ-ZUMAR', 40: 'GHAFIR', 48: 'AL-FATH',
  53: 'AN-NAJM', 55: 'AR-RAHMAN', 57: 'AL-HADID', 62: 'AL-JUMUAH',
  65: 'AT-TALAQ', 67: 'AL-MULK', 89: 'AL-FAJR', 93: 'AD-DUHA', 94: 'ASH-SHARH',
  103: "AL-'ASR", 112: 'AL-IKHLAS', 113: 'AL-FALAQ',
};

export const SURAH_AR: Record<number, string> = {
  2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 6: 'الأنعام', 8: 'الأنفال',
  9: 'التوبة', 11: 'هود', 13: 'الرعد', 17: 'الإسراء', 18: 'الكهف',
  20: 'طه', 21: 'الأنبياء', 27: 'النمل', 29: 'العنكبوت', 32: 'السجدة',
  34: 'سبأ', 39: 'الزمر', 40: 'غافر', 48: 'الفتح', 53: 'النجم',
  55: 'الرحمن', 57: 'الحديد', 62: 'الجمعة', 65: 'الطلاق', 67: 'الملك',
  89: 'الفجر', 93: 'الضحى', 94: 'الشرح', 103: 'العصر', 112: 'الإخلاص',
  113: 'الفلق',
};

// overrideهای دستی (هنگامی که دادهٔ آیه کامل نیست) + قاریان هر آیه
const SPECS: Record<number, TriSpec> = {
  25: {
    label: 'AL-JUMUAH 11',
    arabic:
      'وَإِذَا رَأَوْا تِجَارَةً أَوْ لَهْوًا\nانْفَضُّوا إِلَيْهَا وَتَرَكُوكَ قَائِمًاۭ\nقُلْ مَا عِنْدَ اللَّهِ خَيْرٌ',
    fa: 'و چون تجارت یا سرگرمی ببینند، به آن روی آورند و تو را ایستاده رها کنند. بگو آنچه نزد خداست بهتر است.',
    en: 'When they see some business or amusement, they scatter to it and leave you standing. Say: “What is with Allah is better than amusement and business.”',
    reciters: DEFAULT_TRIPLE,
  },
};

export const triTimingForIndex = (i: number): TriTiming | undefined =>
  (triAudio as Record<string, TriTiming>)[String(i)];

export const triSpecForIndex = (i: number): TriSpec | undefined => SPECS[i];

export const triRecitersForIndex = (i: number): TriReciter[] =>
  (SPECS[i]?.reciters ?? DEFAULT_TRIPLE).map((r, k) => ({
    ...r,
    dur: (triTimingForIndex(i)?.segs[k] ?? 0) as number,
  })) as (TriReciter & {dur: number})[];

// چیدمان بخش‌ها: aFrame شروع و طول هر قاری (فریم)
export function triLayout(t: TriTiming): {from: number; dur: number}[] {
  let acc = 0;
  return t.segs.map((d) => {
    const seg = {from: Math.round(acc * FPS), dur: Math.round(d * FPS)};
    acc += d + t.gap;
    return seg;
  });
}

export const TRI_END_CARD_DUR = 150; // 5s

export function triTotalFrames(i: number): number {
  const t = triTimingForIndex(i);
  if (!t) return 60;
  const audioSec = t.segs.reduce((a, b) => a + b, 0) + (t.segs.length - 1) * t.gap;
  return Math.round(audioSec * FPS) + TRI_END_CARD_DUR;
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
export const toFaDigits = (n: number): string =>
  String(n)
    .split('')
    .map((c) => (/\d/.test(c) ? FA_DIGITS[Number(c)] : c))
    .join('');