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
  // Normalize whitespace first
  const normalized = normalizeWhitespace(input);
  if (!normalized) return '';

  // A simple sentence splitter that captures sequences of non-sentence-ending
  // characters followed by optional sentence-ending punctuation. This keeps
  // existing punctuation but will add a period if missing.
  const sentenceRegex = /([^.!?]+)([.!?]*)/g;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = sentenceRegex.exec(normalized)) !== null) {
    const body = m[1].trim();
    const delim = m[2] || '';
    if (!body) continue;

    // Capitalize first alphabetic character in the sentence
    const firstAlphaIndex = body.search(/[A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff]/);
    let sentence = body;
    if (firstAlphaIndex !== -1) {
      sentence =
        sentence.slice(0, firstAlphaIndex) +
        sentence.charAt(firstAlphaIndex).toUpperCase() +
        sentence.slice(firstAlphaIndex + 1);
    }

    // Ensure terminal punctuation: if none was present, add a period
    const terminal = delim || '.';

    parts.push(sentence + terminal);
  }

  // Join with a single space between sentences
  return parts.join(' ');
}

const exported = {
  titleCase,
  sanitizeTitle,
  sanitizeDescription,
};

export default exported;
