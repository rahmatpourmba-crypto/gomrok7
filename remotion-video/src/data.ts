import ayahsData from './ayahs.json';

export type Ayah = {
  arabic: string;
  fa: string;
  ref: string;
  surah: number;
  surah_name: string;
  ayah: number;
  global: number;
  en?: string;
  ur?: string;
  ku?: string;
};

export const ayahs: Ayah[] = ayahsData as Ayah[];

export const GOLD = '#E8B360';
export const GOLD_LIGHT = '#FFDE96';
export const CAP_TEXT = '#DADEE8';
export const RECITER_LABEL = 'یاسر الدوسری';

export const audioForIndex = (i: number) => `/tilawat/q_${String(i).padStart(3, '0')}.mp3`;

export const durationsForIndex: Record<number, number> = {
  0: 16.05, 1: 54.63, 2: 18.22, 3: 7.31, 4: 29.13, 5: 15.78, 6: 52.95,
  7: 15.45, 8: 34.44, 9: 16.05, 10: 25.06, 11: 5.95, 12: 4.83, 13: 5.75,
  14: 5.94, 15: 3.87, 16: 32.82, 17: 30.75, 18: 6.7, 19: 10.93, 20: 26.26,
  21: 14.32, 22: 18.79, 23: 23.65, 24: 22.68, 25: 22.13, 26: 3.36, 27: 14.24,
  28: 14.95, 29: 16.33, 30: 5.23, 31: 21.35, 32: 40.5, 33: 59.85, 34: 35.53,
  35: 14.32, 36: 11.61, 37: 8.05, 38: 28.46, 39: 13.49, 40: 20.17, 41: 8.03,
  42: 66.56, 43: 10.01, 44: 9.36, 45: 3.04, 46: 8.16, 47: 7.09, 48: 16.44,
  49: 51.31, 50: 18.29, 51: 22.76, 52: 18.35,
};

export const ayahDuration = (i: number): number => durationsForIndex[i] ?? 20;

export const cleanArabic = (arabic: string): string =>
  (arabic || '').split('*')[0].trim();

export const faOf = (a: Ayah): string => a.fa || cleanArabic(a.arabic);

export const enOf = (a: Ayah): string => {
  const en = a.en || '';
  const cleaned = en.split('"')[0].replace(/\\n/g, ' ').replace(/\n/g, ' ').trim();
  return cleaned || a.fa || cleanArabic(a.arabic);
};

export const wordsOf = (text: string): string[] => text.split(/\s+/).filter(Boolean);

// word timings weighted by length (mirrors shorts_engine._word_timings)
export function wordTimings(text: string, dur: number): number[] {
  const words = wordsOf(text);
  if (words.length === 0) return [];
  const weights = words.map((w) => Math.max(w.length, 1) * 0.55 + 1.0);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const pad = Math.min(0.15, dur * 0.035);
  const usable = Math.max(dur - pad, 0.05);
  const fracs = weights.map((w) => w / wsum);
  const durs = fracs.map((f) => usable * f);
  durs[durs.length - 1] += pad;
  return durs;
}

export function activeWordIndex(frame: number, fps: number, timings: number[]): number {
  const t = frame / fps;
  if (timings.length === 0) return 0;
  let acc = 0;
  for (let i = 0; i < timings.length; i++) {
    if (t >= acc && t - acc < timings[i]) return i;
    acc += timings[i];
  }
  return timings.length - 1;
}
