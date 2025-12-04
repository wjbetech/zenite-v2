export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function startOfWeek(d: Date) {
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - d.getDay());
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

export function addDays(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  n.setHours(0, 0, 0, 0);
  return n;
}

export function formatDateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthMatrix(center: Date) {
  const start = startOfWeek(startOfMonth(center));
  const end = endOfMonth(center);
  // End-of-last-week that contains end
  const last = startOfWeek(addDays(end, 6));

  const weeks: Date[][] = [];
  let cursor = new Date(start);
  while (cursor <= last) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}
