import {
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  weeksForMonth,
} from './activity-date';

export type RangeKey = '3m' | '1m' | '1w';

export function computeRangeDays(range: RangeKey, now = new Date()) {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  if (range === '1w') {
    const start = addDays(end, -6);
    const allDays: Date[] = [];
    for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) allDays.push(new Date(cur));
    return { startDate: start, endDate: end, days: allDays };
  }

  if (range === '1m') {
    const monthStart = startOfMonth(end);
    const monthEnd = endOfMonth(end);
    const start = startOfWeek(monthStart);
    const finish = endOfWeek(monthEnd);
    const allDays: Date[] = [];
    for (let cur = new Date(start); cur <= finish; cur = addDays(cur, 1))
      allDays.push(new Date(cur));
    const filtered = allDays.filter((d) => d <= end);
    const clampedEnd = finish > end ? end : finish;
    return { startDate: start, endDate: clampedEnd, days: filtered };
  }

  // 3 months view
  const months: Date[] = [];
  for (let i = 2; i >= 0; i--) {
    months.push(new Date(end.getFullYear(), end.getMonth() - i, 1));
  }
  const allDays: Date[] = [];
  months.forEach((m) => {
    weeksForMonth(m).forEach((w) => w.forEach((d) => allDays.push(d)));
  });
  const start = allDays[0];
  const finish = allDays[allDays.length - 1];
  const filtered = allDays.filter((d) => d <= end);
  const clampedEnd = finish > end ? end : finish;
  return { startDate: start, endDate: clampedEnd, days: filtered };
}
