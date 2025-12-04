'use client';

import React, { useMemo } from 'react';
import type { Task } from '../../lib/taskStore';
import { isIsoString, parseDateOrNull } from '../../lib/taskDateUtils';
import { formatDateKey } from './dateUtils';

type Props = { date: Date; tasks: Task[] };

function hourLabel(h: number) {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true });
}

function hourForTask(t: Task): number | null {
  // Prefer dueTime, then startsAt. dueTime may be ISO or HH:MM
  const candidates = [t.dueTime, t.startsAt];
  for (const c of candidates) {
    if (!c) continue;
    if (isIsoString(c)) {
      const d = parseDateOrNull(c);
      if (d) return d.getHours();
    } else {
      const m = c.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (m) {
        const hh = Number(m[1]);
        if (!Number.isNaN(hh) && hh >= 0 && hh <= 23) return hh;
      }
    }
  }
  return null;
}

export default function DayView({ date, tasks }: Props) {
  const key = formatDateKey(date);

  const START_HOUR = 6; // show hours starting at 6am
  const END_HOUR = 24; // end at midnight (24)

  const buckets = useMemo(() => {
    const arr: Task[][] = Array.from({ length: END_HOUR - START_HOUR }, () => []);
    const allday: Task[] = [];
    for (const t of tasks) {
      // Determine if this task should be shown for the current day:
      // - tasks with an explicit dueDate matching the key
      // - tasks that recur daily
      const dueKey = t.dueDate ? t.dueDate.slice(0, 10) : null;
      const isDaily = (t.recurrence ?? 'once') === 'daily';
      if (!(dueKey === key || isDaily)) continue;
      const h = hourForTask(t);
      // if no time or time outside our displayed range, treat as all-day
      if (h === null || h < START_HOUR || h >= END_HOUR) allday.push(t);
      else arr[h - START_HOUR].push(t);
    }
    // (no debug) return computed buckets
    return { hours: arr, allday } as { hours: Task[][]; allday: Task[] };
  }, [date, tasks, key]);

  return (
    <div className="rounded-[28px] px-0 pt-4 pb-0">
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            All day
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {buckets.allday.length === 0 ? (
              <span className="text-sm text-emerald-700/70">Nothing scheduled all day</span>
            ) : (
              buckets.allday.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-medium text-emerald-800 max-w-full whitespace-normal break-words overflow-hidden"
                >
                  {t.title ?? 'Untitled task'}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/80 px-2 pt-2">
          <div className="max-h-[540px] overflow-y-auto pr-2">
            {buckets.hours.map((tasksForHour, idx) => {
              const h = START_HOUR + idx;
              return (
                <div
                  key={h}
                  className="grid grid-cols-[72px_1fr] gap-4 border-t border-slate-100 py-6 first:border-t-0"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {hourLabel(h)}
                  </div>

                  <div className="flex flex-col gap-2 min-w-0">
                    {tasksForHour.length === 0 ? (
                      <div className="h-16 rounded-xl border border-dashed border-slate-100 bg-slate-50/50" />
                    ) : (
                      tasksForHour.map((t) => (
                        <div
                          key={t.id}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm max-w-full overflow-hidden"
                        >
                          <div className="text-sm font-semibold text-slate-900 whitespace-normal break-words">
                            {t.title ?? 'Untitled task'}
                          </div>
                          {t.notes && (
                            <div className="text-xs text-slate-500 whitespace-normal break-words">
                              {t.notes}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
