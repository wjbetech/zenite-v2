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
  const tasksLoading = useTaskStore((s) => s.loading);
  const tasksError = useTaskStore((s) => s.error);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const projects = useProjectStore((s) => s.projects);
  const resetIfNeeded = useTaskStore((s) => s.resetDailiesIfNeeded);
  const resetNow = useTaskStore((s) => s.resetDailiesNow);
  const loadTasks = useTaskStore((s) => s.loadTasks);
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
    // Ensure tasks are loaded when visiting Dailies. Previously only Dashboard
    // triggered `loadTasks()` which caused /dailies to be empty until Dashboard
    // was visited. Call loadTasks here to keep behavior consistent.
    void loadTasks();

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
  }, [resetIfNeeded, resetNow, loadTasks]);

  const toggle = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    if (t.completed) {
      updateTask(id, { completed: false, started: false, completedAt: null });
      return;
    }
    if (t.started) {
      updateTask(id, { started: false, completed: true, completedAt: new Date().toISOString() });
      return;
    }
    updateTask(id, { started: true, completed: false, completedAt: null });
  };

  const handleSave = (id: string, patch: Partial<Task>) => {
    updateTask(id, patch);
    setEditing(null);
  };

  // deletion is handled from the task card directly; modal no longer supports delete

  return (
    <div className="mx-6 mt-[124px] flex flex-col flex-1 min-h-0 overflow-x-visible max-w-[95%]">
      <header className="max-w-6xl px-3">
        <div className="mx-auto w-full max-w-6xl">
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="display-font text-3xl md:text-3xl font-semibold mb-0 text-center text-emerald-600 md:text-left w-full md:w-auto">
                Dailies
              </h1>
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setTimerOpen((s) => !s)}
                  className="btn-icon  text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                  aria-expanded={timerOpen}
                >
                  {timerOpen ? 'Hide timer' : 'Show timer'}
                </button>
                <button
                  onClick={() => {
                    setCreating(true);
                  }}
                  className="btn btn-success  border-2 border-success-content text-success-content"
                  aria-label="Add daily task"
                >
                  + Add Daily Task
                </button>
              </div>
            </div>
            <div className="flex md:hidden items-center justify-end gap-3">
              <button
                onClick={() => setTimerOpen((s) => !s)}
                className="text-sm text-gray-500 hover:text-gray-700"
                aria-expanded={timerOpen}
              >
                {timerOpen ? 'Hide timer' : 'Show timer'}
              </button>
              <button
                onClick={() => setCreating(true)}
                className="btn btn-ghost btn-sm"
                aria-label="Add daily task"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-10">
          <div className="space-y-6">
            <div className="max-w-md">
              <TimerWidget open={timerOpen} onOpenChange={(v) => setTimerOpen(v)} />
            </div>

            <section className="mb-[74px]">
              <div className="transition-all duration-300 ease-in-out pt-4 pb-2 px-0">
                {tasksLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center w-full">
                    <svg
                      className="animate-spin h-10 w-10 text-success"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <div className="mt-3 text-sm text-base-content/50">Fetching tasks…</div>
                  </div>
                ) : daily.length === 0 ? (
                  tasksError ? (
                    <div className="flex items-center justify-center py-24 w-full">
                      <div className="text-center text-base-content/50">
                        <p>
                          Unable to load tasks — the database may be unavailable. Check your local
                          DB and try again, or contact the administrator (wjbetech@gmail.com)
                        </p>
                      </div>
                    </div>
                  ) : null
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
                      const idOrder = next.map((n) => n.id);
                      const reordered = idOrder
                        .map((id) => tasks.find((t) => t.id === id))
                        .filter(Boolean) as typeof tasks;
                      useTaskStore.getState().setTasks(reordered);
                    }}
                    renderItem={(t) => (
                      <DailyTaskCard
                        key={t.id}
                        task={t}
                        onToggle={toggle}
                        onEdit={edit}
                        onDelete={(id: string) => {
                          const found = tasks.find((x) => x.id === id) ?? null;
                          setDeleting(found);
                        }}
                      />
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
    </div>
  );
}
