export type RangeKey = '3m' | '1m' | '1w';
export type ActivityMap = Record<string, number>; // yyyy-mm-dd -> count

export function formatDateISO(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

export function startOfWeek(d: Date) {
  const n = new Date(d);
  const day = n.getDay();
  n.setDate(n.getDate() - day);
  n.setHours(0, 0, 0, 0);
  return n;
}

export function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  return addDays(s, 6);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 0, 0, 0, 0);
}

export function weeksForMonth(monthDate: Date) {
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const start = startOfWeek(first);
  const finish = endOfWeek(last);
  const weeks: Date[][] = [];
  let cur = new Date(start);
  while (cur <= finish) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function zeroMap(start: Date, end: Date): ActivityMap {
  const map: ActivityMap = {};
  for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) {
    map[formatDateISO(cur)] = 0;
  }
  return map;
}
