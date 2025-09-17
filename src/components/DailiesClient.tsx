'use client';

import React from 'react';
import TaskSection from './TaskSection';
import useTaskStore, { Task } from '../lib/taskStore';
import TimerWidget from './TimerWidget';

export default function DailiesClient() {
  const tasks = useTaskStore((s) => s.tasks) as Task[];
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const resetIfNeeded = useTaskStore((s) => s.resetDailiesIfNeeded);
  const resetNow = useTaskStore((s) => s.resetDailiesNow);
  const edit = (t: Task) => {
    // placeholder: open modal? For now just console
    console.log('edit', t.id);
  };

  const daily = tasks.filter((t) => (t.recurrence ?? 'once') === 'daily');
  const [timerOpen, setTimerOpen] = React.useState(false); // default closed

  // Run reset check on mount, on visibility/focus, and schedule next midnight reset
  React.useEffect(() => {
    // initial check
    try {
      resetIfNeeded();
    } catch (e) {
      console.error('error running resetIfNeeded', e);
    }

    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      const ms = next.getTime() - now.getTime();
      timeoutId = window.setTimeout(() => {
        try {
          resetNow();
        } catch (e) {
          console.error('error running resetNow', e);
        }
        // schedule again for the following midnight
        scheduleNext();
      }, ms);
    };

    scheduleNext();

    const onVisibility = () => resetIfNeeded();
    const onFocus = () => resetIfNeeded();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [resetIfNeeded, resetNow]);

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
              className="text-sm text-gray-500 hover:text-gray-700"
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
