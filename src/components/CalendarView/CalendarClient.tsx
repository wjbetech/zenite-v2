'use client';

import React, { useState } from 'react';
import { startOfWeek, addDays } from './dateUtils';
import useTaskStore from '../../lib/taskStore';
import Calendar from './Calendar';

export default function CalendarClient() {
  const tasks = useTaskStore((state) => state.tasks);

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

  function CalendarHeader() {
    return (
      <div className="py-2">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {view === 'month' ? title : view === 'week' ? weekRangeTitle() : dayTitle()}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full p-1">
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
    );
  }

  return (
    <div className="mx-6 mt-[124px] flex flex-col flex-1 min-h-0 overflow-x-visible pb-12">
      <header className="pb-6">
        <div
          className="mx-auto w-full px-0"
          style={{ maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)', boxSizing: 'border-box' }}
        >
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="display-font text-3xl md:text-3xl font-semibold mb-0 text-center text-emerald-600 md:text-left w-full md:w-auto">
                Calendar
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* calendar header + controls — placed outside the scrollable area so it doesn't scroll with the calendar */}
        <div
          className="mx-auto w-full"
          style={{ maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)', boxSizing: 'border-box' }}
        >
          <CalendarHeader />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pt-2 pb-0">
          <div className="space-y-3">
            <section className="mb-4">
              <div className="transition-all duration-150 ease-in-out pt-2 pb-0 px-0">
                <Calendar tasks={tasks} center={center} view={view} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
