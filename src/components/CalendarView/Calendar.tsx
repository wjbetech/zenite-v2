'use client';

import React from 'react';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import { AnimatePresence, motion } from 'framer-motion';
import { startOfWeek, addDays, formatDateKey } from './dateUtils';
import type { Task } from '../../lib/taskStore';

type Props = {
  tasks: Task[];
  center: Date;
  view: 'month' | 'week' | 'day';
};

export default function Calendar({ tasks, center, view }: Props) {
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

  // header controls are provided by the page-level CalendarClient; Calendar only renders views.

  return (
    <div className="rounded-[32px] shadow-2xl shadow-emerald-100/40">
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
