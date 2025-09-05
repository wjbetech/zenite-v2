'use client';

import React from 'react';
import TaskSection from './TaskSection';
import useTaskStore, { Task } from '../lib/taskStore';
import TimerWidget from './TimerWidget';

export default function DailiesClient() {
  const tasks = useTaskStore((s) => s.tasks) as Task[];
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const edit = (t: Task) => {
    // placeholder: open modal? For now just console
    console.log('edit', t.id);
  };

  const daily = tasks.filter((t) => (t.recurrence ?? 'once') === 'daily');
  const [timerOpen, setTimerOpen] = React.useState(false); // default closed

  return (
    <main className="p-6">
      <div className="flex flex-col gap-4">
        {/* Header: title centered on mobile, left aligned on desktop. Toggle on the right for md+. */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-2xl font-semibold mb-0 text-center md:text-left md:pl-4 w-full md:w-auto">
            Dailies
          </h1>
          <div className="hidden md:block">
            <button
              onClick={() => setTimerOpen((s) => !s)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300"
              aria-expanded={timerOpen}
            >
              {timerOpen ? 'Hide timer' : 'Show timer'}
            </button>
          </div>
        </div>

        {/* Content area: on mobile the timer sits above the cards (stacked). On md+ it's a row with tasks on the left and the timer as a right column (max width ~300px). */}
        <div className="flex flex-col">
          {/* Timer sits above cards always; on md+ it's right-aligned with a max width */}
          <div className="pt-4 pl-4 pr-4 pb-2 w-full">
            <TimerWidget open={timerOpen} onOpenChange={(v) => setTimerOpen(v)} />
          </div>

          <div className="mt-4">
            <TaskSection
              tasks={daily}
              accentClass="border-emerald-400"
              onEdit={edit}
              onDelete={deleteTask}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
