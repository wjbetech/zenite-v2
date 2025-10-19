import { useEffect, useState } from 'react';

export default function usePersistedActivity() {
  const [persistedActivity, setPersistedActivity] = useState<
    Record<string, { count: number; titles: string[] }>
  >({});

  useEffect(() => {
    // Fetch recent persisted activity (last 90 days) to merge with in-memory task completions
    (async () => {
      try {
        const res = await fetch('/api/activity');
        if (!res.ok) return;
        const rows = (await res.json()) as Array<Record<string, unknown>>;
        const agg: Record<string, { count: number; titles: string[] }> = {};
        // Track which taskIds the server already reported for each date so we can
        // avoid double-counting local snapshot items that are duplicates.
        const serverSeen: Record<string, Set<string>> = {};
        for (const r of rows) {
          const date = String(r.date ?? '');
          const title = String(r.taskTitle ?? 'Untitled');
          const taskId = String(r.taskId ?? '');
          if (!date) continue;
          if (!agg[date]) agg[date] = { count: 0, titles: [] };
          agg[date].count += 1;
          agg[date].titles.push(title);
          if (taskId) {
            serverSeen[date] = serverSeen[date] ?? new Set();
            serverSeen[date].add(taskId);
          }
        }

        // Merge with any local snapshots; local snapshots are fallbacks when server POST failed.
        // We prefer server data for a given date/taskId, but still include local-only items.
        try {
          if (typeof window !== 'undefined') {
            // find local snapshot keys for last 90 days
            const now = new Date();
            for (let i = 0; i < 90; i++) {
              const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
              const key = `zenite:activity:snapshots:v1:${d.toISOString().slice(0, 10)}`;
              const raw = window.localStorage.getItem(key);
              if (!raw) continue;
              try {
                const items = JSON.parse(raw) as Array<Record<string, unknown>>;
                for (const it of items) {
                  const date = String(it.date ?? d.toISOString().slice(0, 10));
                  const title = String(it.taskTitle ?? 'Untitled');
                  const taskId = String(it.taskId ?? '');
                  // If the server already reported this taskId for the same date, skip it.
                  if (taskId && serverSeen[date] && serverSeen[date].has(taskId)) continue;
                  if (!agg[date]) agg[date] = { count: 0, titles: [] };
                  agg[date].count += 1;
                  agg[date].titles.push(title);
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        } catch {
          // ignore local snapshot errors
        }
        setPersistedActivity(agg);
      } catch {
        // ignore
      }
    })();
  }, []);

  return persistedActivity;
}
