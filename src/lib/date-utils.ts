export function daysUntil(date?: string | null) {
  if (!date) return Infinity;
  const d = new Date(date);
  const now = new Date();
  // compute date-only UTC timestamps to avoid local timezone shifting seeded ISO dates
  const dUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = Math.ceil((dUtc - nowUtc) / (1000 * 60 * 60 * 24));
  return diff;
}
