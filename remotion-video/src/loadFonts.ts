import {continueRender, delayRender, staticFile} from 'remotion';

const FONT_FACES: Array<[string, string, number]> = [
  ['Vazirmatn', staticFile('/fonts/Vazirmatn-Black.ttf'), 900],
  ['Vazirmatn', staticFile('/fonts/Vazirmatn-Bold-1.ttf'), 700],
  ['Amiri', staticFile('/fonts/Amiri-Bold.ttf'), 700],
];

const registeredFamilies = new Set<string>();

export async function loadFonts(): Promise<void> {
  for (const [family, src, weight] of FONT_FACES) {
    const key = `${family}-${weight}`;
    if (registeredFamilies.has(key)) continue;
    try {
      const res = await fetch(src);
      const buf = await res.arrayBuffer();
      const face = new FontFace(family, buf, {weight: String(weight)});
      await face.load();
      (document as Document).fonts.add(face);
      registeredFamilies.add(key);
    } catch (e) {
      // font may be reloaded on subsequent renders; skip
    }
  }
}

// Ensure fonts are loaded before the first frame renders.
const waitHandle = delayRender('Waiting for fonts to load');
loadFonts()
  .then(() => continueRender(waitHandle))
  .catch(() => continueRender(waitHandle));
