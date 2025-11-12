/**
 * Title / formatting helpers for user-visible strings.
 * Keep this focused: normalize whitespace, then apply title-casing with a
 * small-word list that remains lowercase unless it's the first word.
 */
import { normalizeWhitespace, normalizeWhitespaceForTyping } from './text-sanitizer';

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

function isAllUpper(core: string) {
  if (!core) return false;
  // strip punctuation like dots, parentheses, hyphens to evaluate the core letters/digits
  const cleaned = core.replace(/[^A-Za-z0-9]/g, '');
  if (!cleaned) return false;
  return cleaned === cleaned.toUpperCase();
}

function countUpperLetters(core: string) {
  const m = core.match(/[A-Z]/g);
  return m ? m.length : 0;
}

function transformCoreForTypo(core: string) {
  // Lowercase everything then capitalize first char (fixes LOndon -> London)
  if (!core) return core;
  const lowered = core.toLowerCase();
  return lowered.charAt(0).toUpperCase() + lowered.slice(1);
}

function formatWordPreserveAcronym(raw: string, capitalizeFallback = true) {
  // Preserve surrounding punctuation, operate on the core alphanumeric segment
  const match = raw.match(/^([^A-Za-z0-9]*)([A-Za-z0-9'’().,;:\-]+)([^A-Za-z0-9]*)$/);
  if (!match) return capitalizeFallback ? capitalizeWord(raw) : raw;

  const [, leading, core, trailing] = match;

  // If core is all-upper (and length>1) treat as an acronym and preserve
  if (core.length > 1 && isAllUpper(core)) {
    return leading + core + trailing;
  }

  const upperCount = countUpperLetters(core);
  // If there are multiple uppercase letters but not all uppercase, we assume a typo like LOndon
  if (upperCount > 1 && !isAllUpper(core)) {
    return leading + transformCoreForTypo(core) + trailing;
  }

  // Otherwise fallback to the usual capitalize behavior (first upper, rest lower)
  if (capitalizeFallback) return leading + capitalizeWord(core) + trailing;
  return leading + core + trailing;
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
            if (idx === 0 && subIdx === 0) return formatWordPreserveAcronym(p, true);
            // Otherwise, keep small words lowercase
            if (smallSet.has(lowerP)) return lowerP;
            return formatWordPreserveAcronym(p, true);
          })
          .join('-');
      }

      const lower = raw.toLowerCase();
      if (idx !== 0 && smallSet.has(lower)) return lower; // keep small words lowercase unless first
      return formatWordPreserveAcronym(raw, true);
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

/**
 * Sanitize a description while preserving paragraph/newline boundaries.
 * Each paragraph (separated by one or more newlines) is sanitized as a
 * standalone block (capitalized sentences, terminal punctuation ensured)
 * and paragraphs are rejoined with a single blank line between them.
 */
export function sanitizeDescriptionPreserveNewlines(input: string): string {
  if (!input) return '';
  // Normalize CRLF -> LF and collapse weird whitespace, but keep newlines
  const normalized = normalizeWhitespaceForTyping(input).replace(/\r\n?/g, '\n');
  // Split into paragraphs on one or more newlines
  const paragraphs = normalized
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return '';

  const sanitized = paragraphs
    .map((para) => {
      // Reuse existing sentence logic by calling sanitizeDescription on the paragraph
      return sanitizeDescription(para);
    })
    .join('\n\n');

  return sanitized;
}

const exported = {
  titleCase,
  sanitizeTitle,
  sanitizeDescription,
};

export default exported;
