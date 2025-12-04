'use client';

import React from 'react';
import type { Task } from '../../lib/taskStore';

type Props = {
  date: Date;
  tasks: Task[];
  inMonth?: boolean;
  isToday?: boolean;
};

export default function DayCell({ date, tasks, inMonth = true, isToday = false }: Props) {
  const key = date.toISOString().slice(0, 10);
  const dayNum = date.getDate();
  const visible = tasks.slice(0, 3);
  const more = Math.max(0, tasks.length - visible.length);

  const containerClasses = [
    'group relative flex min-w-0 min-h-[110px] flex-col rounded-2xl border p-3 transition-all duration-200',
    inMonth ? 'bg-white/90 hover:-translate-y-0.5 hover:shadow-lg' : 'bg-slate-50 text-slate-400',
    isToday
      ? 'border-emerald-300 shadow-[0_25px_60px_rgba(16,185,129,0.15)] ring-1 ring-emerald-100'
      : 'border-slate-100',
  ].join(' ');

  return (
    <div className={containerClasses} data-date={key}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">{dayNum}</div>
        {isToday && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Today
          </span>
        )}
      </div>

      <div className="mt-3 flex-1 overflow-hidden">
        {visible.length === 0 ? (
          <div className="text-xs text-slate-400">No plans</div>
        ) : (
          <ul className="flex flex-col gap-2 text-xs text-slate-700">
            {visible.map((t) => (
              <li
                key={t.id}
                className="max-w-full overflow-hidden whitespace-normal break-words rounded-xl border border-emerald-100/70 bg-emerald-50/70 px-2 py-1 font-medium text-emerald-800"
              >
                {t.title ?? 'Untitled task'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {more > 0 && <div className="mt-2 text-xs font-medium text-emerald-700">+{more} more</div>}
    </div>
  );
}
