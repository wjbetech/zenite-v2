import { daysUntil } from '../date-utils';

describe('daysUntil', () => {
  it('returns Infinity for undefined or null', () => {
    expect(daysUntil(undefined)).toBe(Infinity);
    expect(daysUntil(null)).toBe(Infinity);
  });

  it('returns 0 for today', () => {
    const todayIso = new Date().toISOString();
    expect(daysUntil(todayIso)).toBe(0);
  });

  it('returns positive for future dates and negative for past', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntil(tomorrow)).toBeGreaterThanOrEqual(1);
    expect(daysUntil(yesterday)).toBeLessThanOrEqual(-1);
  });

  it('is timezone insensitive for date-only comparisons', () => {
    // Create a date at UTC midnight and ensure it counts as 0 if today (regardless of local tz)
    const now = new Date();
    const utcMid = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    expect(daysUntil(utcMid.toISOString())).toBe(0);
  });
});
