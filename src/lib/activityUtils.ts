export type PersistedActivity = Record<string, { count: number; titles: string[] }>;
export type TaskLike = {
  id?: string;
  title?: string | null;
  completed?: boolean;
  completedAt?: string | null;
  createdAt?: string;
};

export function buildActivityFrom(persistedActivity: PersistedActivity, storeTasks: TaskLike[]) {
  const titleSets: Record<string, Set<string>> = {};
  const idSets: Record<string, Set<string>> = {};

  // Start with persisted snapshots (titles only)
  for (const [date, info] of Object.entries(persistedActivity)) {
    titleSets[date] = titleSets[date] ?? new Set();
    for (const t of info.titles) {
      titleSets[date].add(t);
    }
  }

  // Merge live task completions only into today's bucket
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = `${now.getMonth() + 1}`.padStart(2, '0');
  const todayD = `${now.getDate()}`.padStart(2, '0');
  const todayKey = `${todayY}-${todayM}-${todayD}`;

  for (const t of storeTasks) {
    if (!t.completed) continue;
    const when = (t.completedAt as string) || (t.createdAt as string) || '';
    if (!when) continue;
    let date: string;
    if (/^\d{4}-\d{2}-\d{2}$/.test(when)) {
      date = when as string;
    } else {
      const d = new Date(when);
      const y = d.getFullYear();
      const m = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      date = `${y}-${m}-${day}`;
    }
    if (date !== todayKey) continue;

    idSets[date] = idSets[date] ?? new Set();
    if (t.id && idSets[date].has(t.id)) continue;
    if (t.id) idSets[date].add(t.id);

    titleSets[date] = titleSets[date] ?? new Set();
    titleSets[date].add(t.title || 'Untitled');
  }

  const map: Record<string, number> = {};
  const details: Record<string, string[]> = {};
  for (const [date, set] of Object.entries(titleSets)) {
    map[date] = set.size;
    details[date] = Array.from(set);
  }

  return { activityMap: map, activityDetails: details };
}
