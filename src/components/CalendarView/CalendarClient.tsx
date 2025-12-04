'use client';

import React from 'react';
import useTaskStore from '../../lib/taskStore';
import Calendar from './Calendar';

export default function CalendarClient() {
  const tasks = useTaskStore((state) => state.tasks);

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
        <div className="flex-1 min-h-0 overflow-y-auto pt-2 pb-0">
          <div className="space-y-3">
            <section className="mb-4">
              <div className="transition-all duration-150 ease-in-out pt-2 pb-0 px-0">
                <Calendar tasks={tasks} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
