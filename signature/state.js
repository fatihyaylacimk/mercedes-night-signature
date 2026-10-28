import {sample} from '../studio/timeline.js';

export const ATMOSPHERES = ['night', 'studio', 'sunset'];
export const DURATIONS = [5, 8, 8, 8, 8, 8];
export const TOTAL_SECONDS = DURATIONS.reduce((a, b) => a + b, 0);
const POSES = [[.005, .13], [.15, .32], [.355, .43], [.43, .47], [.67, .82], [.89, .98]];
export const clamp = (value, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, value));

export function cleanName(value) {
  if (typeof value !== 'string') return '';
  return Array.from(value.normalize('NFKC').replace(/[^\p{L}\p{M}\p{N} .'’\-]/gu, '').replace(/\s+/g, ' ').trim()).slice(0, 24).join('');
}

export function possessive(value, lang = 'tr') {
  const name = cleanName(value);
  if (!name) return lang === 'en' ? 'Your' : 'Senin';
  if (lang === 'en') return name + (/s$/i.test(name) ? '’' : '’s');
  const vowels = name.toLocaleLowerCase('tr-TR').match(/[aeıioöuü]/g);
  const last = vowels?.at(-1) || 'i';
  const suffix = 'aı'.includes(last) ? 'ın' : 'ou'.includes(last) ? 'un' : 'öü'.includes(last) ? 'ün' : 'in';
  return name + '’' + (/[aeıioöuü]$/i.test(name.toLocaleLowerCase('tr-TR')) ? 'n' : '') + suffix;
}

export function normalizeConfig(input = {}) {
  const value = input && typeof input === 'object' ? input : {};
  return {
    name: cleanName(value.name),
    atmosphere: ATMOSPHERES.includes(value.atmosphere) ? value.atmosphere : 'night',
    lang: value.lang === 'en' ? 'en' : 'tr',
    chapter: Number.isInteger(value.chapter) ? clamp(value.chapter, 0, 5) : 0,
  };
}

// Fragments stay on the client; a shared name is not sent in an HTTP query.
export function encodeExperience(input) {
  const config = normalizeConfig(input);
  const params = new URLSearchParams({v: '1', a: config.atmosphere, l: config.lang, c: String(config.chapter)});
  if (config.name) params.set('n', config.name);
  return '#' + params.toString();
}

export function decodeExperience(hash) {
  if (typeof hash !== 'string' || hash.length > 1000) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.get('v') !== '1') return null;
  return normalizeConfig({name: params.get('n'), atmosphere: params.get('a'), lang: params.get('l'), chapter: /^\d$/.test(params.get('c') || '') ? Number(params.get('c')) : 0});
}

export function chapterTime(index, local = 0) {
  const chapter = clamp(Number.isInteger(index) ? index : 0, 0, 5);
  return DURATIONS.slice(0, chapter).reduce((a, b) => a + b, 0) + DURATIONS[chapter] * clamp(Number.isFinite(local) ? local : 0);
}

export function timelineAt(seconds) {
  const elapsed = clamp(Number.isFinite(seconds) ? seconds : 0, 0, TOTAL_SECONDS);
  let remaining = elapsed;
  for (let chapter = 0; chapter < DURATIONS.length; chapter++) {
    if (remaining < DURATIONS[chapter] || chapter === DURATIONS.length - 1) {
      return {chapter, local: clamp(remaining / DURATIONS[chapter]), progress: elapsed / TOTAL_SECONDS, elapsed, complete: elapsed >= TOTAL_SECONDS};
    }
    remaining -= DURATIONS[chapter];
  }
}

export function poseAt(chapter, local = 0) {
  const index = clamp(Number.isInteger(chapter) ? chapter : 0, 0, 5);
  const [a, b] = POSES[index];
  return sample(a + (b - a) * clamp(Number.isFinite(local) ? local : 0));
}

export function timeLabel(seconds) {
  const safe = Math.floor(clamp(Number.isFinite(seconds) ? seconds : 0, 0, TOTAL_SECONDS));
  return '00:' + String(safe).padStart(2, '0');
}
