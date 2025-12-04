'use client';

import React, { useState } from 'react';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import { AnimatePresence, motion } from 'framer-motion';
import { startOfWeek, addDays, formatDateKey } from './dateUtils';
import type { Task } from '../../lib/taskStore';

type Props = { tasks: Task[] };

export default function Calendar({ tasks }: Props) {
  const [center, setCenter] = useState(() => new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const title = center.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const weekRangeTitle = () => {
    const start = startOfWeek(center);
    const end = addDays(start, 6);
    const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${startStr} — ${endStr}`;
  };

  const dayTitle = () =>
    center.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  const viewOptions: Array<{ id: 'month' | 'week' | 'day'; label: string }> = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
  ];

  const handleToday = () => {
    setView('day');
    setCenter(new Date());
  };

  return (
    <div className="rounded-[32px] shadow-2xl shadow-emerald-100/40">
      <div
        className="mx-auto w-full px-0"
        style={{ maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)', boxSizing: 'border-box' }}
      >
        <div className="flex flex-col gap-4 px-0 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              {view === 'month' ? title : view === 'week' ? weekRangeTitle() : dayTitle()}
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 p-1">
                {viewOptions.map(({ id, label }) => {
                  const active = view === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                        active
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200/60'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                onClick={handleToday}
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-0 mx-auto w-full"
        style={{ maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)', boxSizing: 'border-box' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${formatDateKey(center)}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {view === 'month' ? (
              <MonthView month={center} tasks={tasks} />
            ) : view === 'week' ? (
              <WeekView center={center} tasks={tasks} />
            ) : (
              <DayView date={center} tasks={tasks} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
