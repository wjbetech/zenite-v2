'use client';

import React from 'react';
import useTaskStore, { Task } from '../lib/taskStore';
import useProjectStore from '../lib/projectStore';
import TimerWidget from './TimerWidget';
import DailyTaskCard from './DailyTaskCard';
import NativeSortableDaily from './NativeSortableDaily';
import EditTaskModal from './EditTaskModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CreateDailyModal from './CreateDailyModal';

export default function DailiesClient() {
  const tasks = useTaskStore((s) => s.tasks) as Task[];
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const projects = useProjectStore((s) => s.projects);
  const resetIfNeeded = useTaskStore((s) => s.resetDailiesIfNeeded);
  const resetNow = useTaskStore((s) => s.resetDailiesNow);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [deleting, setDeleting] = React.useState<Task | null>(null);
  const [creating, setCreating] = React.useState(false);
  const edit = (t: Partial<Task> | string) => {
    // accept either a Task-like object or an id string
    const id = typeof t === 'string' ? t : t?.id;
    if (!id) return;
    const found = tasks.find((x) => x.id === id) ?? null;
    if (found) setEditing(found);
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

  const toggle = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    if (t.completed) {
      updateTask(id, { completed: false, started: false });
      return;
    }
    if (t.started) {
      updateTask(id, { started: false, completed: true });
      return;
    }
    updateTask(id, { started: true, completed: false });
  };

  const handleSave = (id: string, patch: Partial<Task>) => {
    updateTask(id, patch);
    setEditing(null);
  };

  // deletion is handled from the task card directly; modal no longer supports delete

  return (
    <main className="p-6">
      <div className="flex flex-col gap-4">
        {/* Header: title centered on mobile, left aligned on desktop. Toggle on the right for md+. */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-2xl font-semibold mb-0 text-center md:text-left md:pl-4 w-full md:w-auto">
            Dailies
          </h1>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTimerOpen((s) => !s)}
              className="text-sm text-gray-500 hover:text-gray-700"
              aria-expanded={timerOpen}
            >
              {timerOpen ? 'Hide timer' : 'Show timer'}
            </button>
            <button
              onClick={() => {
                // open create modal; after creation we'll allow editing
                setCreating(true);
              }}
              className="btn btn-success btn-sm"
              aria-label="Add daily task"
            >
              + Add Daily Task
            </button>
          </div>
          {/* mobile add button - small and visible on md:hidden */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setCreating(true)}
              className="btn btn-ghost btn-sm"
              aria-label="Add daily task"
            >
              + Add
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
            <section className="mb-[74px]">
              <div className="overflow-y-auto transition-all duration-300 ease-in-out pt-4 pl-4 pr-4 pb-2">
                {daily.length === 0 ? (
                  <div className="text-sm text-neutral-content">No items.</div>
                ) : (
                  <NativeSortableDaily
                    items={daily.map((t) => ({
                      id: t.id,
                      title: t.title,
                      notes: t.notes,
                      started: !!t.started,
                      completed: !!t.completed,
                      href: undefined,
                      projectName: projects.find((p) => p.id === t.projectId)?.name,
                    }))}
                    onReorder={(next) => {
                      // next is array of DailyTask-like objects in new order; map back to Task order
                      const idOrder = next.map((n) => n.id);
                      const reordered = idOrder
                        .map((id) => tasks.find((t) => t.id === id))
                        .filter(Boolean) as typeof tasks;
                      // persist ordering in store
                      useTaskStore.getState().setTasks(reordered);
                    }}
                    renderItem={(t) => (
                      <div className="mb-6" key={t.id}>
                        <DailyTaskCard
                          task={t}
                          onToggle={toggle}
                          onEdit={edit}
                          onDelete={(id: string) => {
                            const found = tasks.find((x) => x.id === id) ?? null;
                            setDeleting(found);
                          }}
                        />
                      </div>
                    )}
                    containerClassName="space-y-6 md:space-y-7 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-6"
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <EditTaskModal
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        task={editing}
        onSave={handleSave}
      />
      <CreateDailyModal open={creating} onOpenChange={(v) => setCreating(v)} />
      <ConfirmDeleteModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        itemTitle={deleting?.title}
        onConfirm={() => {
          if (!deleting) return;
          deleteTask(deleting.id);
          setDeleting(null);
        }}
      />
    </main>
  );
}
