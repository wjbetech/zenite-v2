/**
 * String utilities
 */
export function truncatePreserveWords(input: string | undefined | null, max = 15): string {
  if (!input) return '';
  const s = input.trim();
  if (s.length <= max) return s;

  // Try to respect word boundaries: find the last space before the limit
  const candidate = s.slice(0, max + 1); // include one extra to detect a following space
  const lastSpace = candidate.lastIndexOf(' ');
  if (lastSpace > 0) {
    const trimmed = candidate.slice(0, lastSpace).trim();
    if (trimmed.length > 0) return trimmed + '…';
  }

  // Fallback: truncate at max chars
  return s.slice(0, max).trimEnd() + '…';
}

export default truncatePreserveWords;
