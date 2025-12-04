'use client';

import React from 'react';
import { getMonthMatrix, formatDateKey } from './dateUtils';
import DayCell from './DayCell';
import type { Task } from '../../lib/taskStore';

type Props = {
  month: Date;
  tasks: Task[];
};

export default function MonthView({ month, tasks }: Props) {
  const weeks = getMonthMatrix(month);
  const todayKey = formatDateKey(new Date());

  // Group tasks by date key
  const taskMap: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const key = t.dueDate.slice(0, 10);
    taskMap[key] = taskMap[key] ?? [];
    taskMap[key].push(t);
  }

  return (
    <div className="w-full rounded-3xl px-0 py-4">
      <div className="grid grid-cols-7 gap-3 px-0 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-3">
        {weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map((d) => {
              const key = formatDateKey(d);
              const items = taskMap[key] ?? [];
              const inMonth = d.getMonth() === month.getMonth();
              const isToday = key === todayKey;
              return (
                <DayCell key={key} date={d} inMonth={inMonth} isToday={isToday} tasks={items} />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
