'use client';

import React from 'react';
import { startOfWeek, addDays, formatDateKey } from './dateUtils';
import DayCell from './DayCell';
import type { Task } from '../../lib/taskStore';

type Props = {
  center: Date;
  tasks: Task[];
};

export default function WeekView({ center, tasks }: Props) {
  const start = startOfWeek(center);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) days.push(addDays(start, i));

  const taskMap: Record<string, Task[]> = {};
  const todayKey = formatDateKey(new Date());
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const key = t.dueDate.slice(0, 10);
    taskMap[key] = taskMap[key] ?? [];
    taskMap[key].push(t);
  }

  return (
    <div className="w-full rounded-3xl px-0 py-4">
      <div className="grid grid-cols-7 gap-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-3">
        {days.map((d) => {
          const key = formatDateKey(d);
          const items = taskMap[key] ?? [];
          const isToday = key === todayKey;
          return <DayCell key={key} date={d} isToday={isToday} tasks={items} />;
        })}
      </div>
    </div>
  );
}
