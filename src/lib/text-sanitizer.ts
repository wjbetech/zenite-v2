/**
 * Basic text sanitization utilities used across the app.
 * Keep these small and well-typed so they're easy to test and reuse.
 */

/** Normalize line endings and collapse repeated whitespace to single spaces. */
export function normalizeWhitespace(input: string): string {
  if (!input) return '';
  // Replace CRLF and CR with LF first, then collapse all whitespace runs into a single space
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v\u00A0\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Trim and collapse multiple spaces, preserving basic punctuation spacing. */
export function trimAndCollapseSpaces(input: string): string {
  if (!input) return '';
  return input.replace(/\s+/g, ' ').trim();
}

/** Capitalize only the very first letter of the string (leaves the rest unchanged). */
export function capitalizeFirstLetter(input: string): string {
  if (!input) return '';
  const first = input.charAt(0).toUpperCase();
  return first + input.slice(1);
}

/**
 * Convert a text to sentence case: first character capitalized, rest lowercased,
 * but preserves existing punctuation and spacing after normalization.
 */
export function toSentenceCase(input: string): string {
  if (!input) return '';
  const trimmed = normalizeWhitespace(input);
  if (!trimmed) return '';

  // Find the first alpha character to capitalize, lowercase the rest
  const firstAlphaIndex = trimmed.search(/[A-Za-zÀ-ÖØ-öø-ÿ]/);
  if (firstAlphaIndex === -1) return trimmed;

  // If the first alpha is at the very start (index 0) — capitalize it and
  // lowercase the remainder. If the first alpha occurs later (e.g. after
  // numbers/punctuation), return the whole trimmed string lowercased so we
  // don't introduce an unexpected uppercase in the middle.
  if (firstAlphaIndex === 0) {
    const firstChar = trimmed.charAt(0).toUpperCase();
    const after = trimmed.slice(1).toLowerCase();
    return firstChar + after;
  }

  return trimmed.toLowerCase();
}

/**
 * High-level sanitize function that applies a sensible default pipeline:
 * - normalize whitespace
 * - optionally convert to sentence case
 * - ensure first letter is capitalized
 */
export function sanitizeText(input: string, options?: { sentenceCase?: boolean }): string {
  if (!input) return '';
  let out = normalizeWhitespace(input);
  if (options?.sentenceCase) {
    out = toSentenceCase(out);
  } else {
    // still ensure first letter is capitalized, but keep rest as-is
    out = capitalizeFirstLetter(out);
  }
  return out;
}

export default sanitizeText;
