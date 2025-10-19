/**
 * Title / formatting helpers for user-visible strings.
 * Keep this focused: normalize whitespace, then apply title-casing with a
 * small-word list that remains lowercase unless it's the first word.
 */
import { normalizeWhitespace } from './text-sanitizer';

const DEFAULT_SMALL_WORDS = [
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'for',
  'nor',
  'on',
  'at',
  'to',
  'from',
  'by',
  'of',
  'in',
  'with',
  'as',
  'vs',
  'via',
  'so',
  'per',
];

export function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function titleCase(input: string, smallWords: string[] = DEFAULT_SMALL_WORDS): string {
  if (!input) return '';
  const normalized = normalizeWhitespace(input);
  if (!normalized) return '';

  const smallSet = new Set(smallWords.map((w) => w.toLowerCase()));

  const parts = normalized.split(' ');
  return parts
    .map((raw, idx) => {
      // Preserve words that contain digits (versions, ranges like 1-2) as-is
      if (/[0-9]/.test(raw)) return raw;

      // Handle hyphenated words by capitalizing each subpart while
      // respecting the small-word rules for non-leading subparts.
      if (raw.includes('-')) {
        return raw
          .split('-')
          .map((p, subIdx) => {
            const lowerP = p.toLowerCase();
            // preserve numbers as-is
            if (/[0-9]/.test(p)) return p;
            // If this is the very first word and first subpart, capitalize
            if (idx === 0 && subIdx === 0) return capitalizeWord(p);
            // Otherwise, keep small words lowercase
            if (smallSet.has(lowerP)) return lowerP;
            return capitalizeWord(p);
          })
          .join('-');
      }

      const lower = raw.toLowerCase();
      if (idx !== 0 && smallSet.has(lower)) return lower; // keep small words lowercase unless first
      return capitalizeWord(raw);
    })
    .join(' ');
}

export function sanitizeTitle(input: string): string {
  return titleCase(input);
}

export function sanitizeDescription(input: string): string {
  // For descriptions, just normalize whitespace and trim — don't title-case
  return normalizeWhitespace(input);
}

const exported = {
  titleCase,
  sanitizeTitle,
  sanitizeDescription,
};

export default exported;
