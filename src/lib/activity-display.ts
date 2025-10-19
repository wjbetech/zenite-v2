export function colorForCount(count: number) {
  if (!count) return 'bg-transparent';
  const colors = [
    'bg-success/20',
    'bg-success/30',
    'bg-success/40',
    'bg-success/50',
    'bg-success/60',
    'bg-success/70',
  ];
  const idx = Math.min(Math.max(count, 1), colors.length) - 1;
  return colors[idx];
}

export function borderForCount(count: number) {
  if (!count) return 'border-2 border-gray-400';
  const borders = [
    'border-2 border-emerald-100',
    'border-2 border-emerald-200',
    'border-2 border-emerald-300',
    'border-2 border-emerald-400',
    'border-2 border-emerald-500',
    'border-2 border-emerald-600',
  ];
  const idx = Math.min(Math.max(count, 1), borders.length) - 1;
  return borders[idx];
}

export function getOrdinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function formatTooltipDateFromISO(iso: string) {
  try {
    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, day] = iso.split('-').map((s) => parseInt(s, 10));
      d = new Date(y, m - 1, day, 0, 0, 0, 0);
    } else {
      d = new Date(iso);
    }
    const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
    const monthAbbrev = d.toLocaleDateString(undefined, { month: 'short' });
    const month = monthAbbrev.endsWith('.') ? monthAbbrev : `${monthAbbrev}.`;
    const day = d.getDate();
    const ord = getOrdinal(day);
    return `${weekday}, ${month} ${day}${ord}:`;
  } catch {
    return iso;
  }
}
