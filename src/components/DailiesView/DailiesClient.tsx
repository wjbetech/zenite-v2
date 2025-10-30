'use client';

import React from 'react';
import useTaskStore, { Task } from '../../lib/taskStore';
import useProjectStore from '../../lib/projectStore';
import TimerWidget from '../TimerWidget';
import TaskCard, { type Task as CardTask } from '../TaskCard';
import NativeSortableDaily from '../NativeSortableDaily';
import EditTaskModal from '../modals/EditTaskModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import TaskModal from '../modals/TaskModal';
import useDailyResetScheduler from '../../hooks/useDailyResetScheduler';
import DailiesLoading from './DailiesLoading';
import DailiesEmpty from './DailiesEmpty';
import DailiesError from './DailiesError';
import useSettingsStore from '../../lib/settingsStore';
import { mapTasksToSortableItems } from '../../lib/task-mappers';

export default function DailiesClient() {
  const tasks = useTaskStore((s) => s.tasks) as Task[];
  const tasksLoading = useTaskStore((s) => s.loading);
  const tasksError = useTaskStore((s) => s.error);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const projects = useProjectStore((s) => s.projects);
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

  const density = useSettingsStore((s) => s.density);
  const view: 'full' | 'mini' = density === 'compact' ? 'mini' : 'full';

  // Extracted to a hook for testability and separation of concerns
  useDailyResetScheduler();

  // status changes are handled via TaskCard onStatusChange

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
                  <DailiesLoading />
                ) : daily.length === 0 ? (
                  tasksError ? (
                    <DailiesError />
                  ) : (
                    <DailiesEmpty />
                  )
                ) : (
                  <NativeSortableDaily
                    items={mapTasksToSortableItems(daily, projects)}
                    onReorder={(next) => {
                      const idOrder = next.map((n) => n.id);
                      const reordered = idOrder
                        .map((id) => tasks.find((t) => t.id === id))
                        .filter(Boolean) as typeof tasks;
                      useTaskStore.getState().setTasks(reordered);
                    }}
                    renderItem={(t) => (
                      <TaskCard
                        key={t.id}
                        task={t as unknown as CardTask}
                        view={view}
                        right={t.projectName}
                        href={t.href}
                        onEdit={(task) => {
                          // accept either id or object in edit helper
                          edit(task.id || task);
                        }}
                        onDelete={(id: string) => {
                          const found = tasks.find((x) => x.id === id) ?? null;
                          setDeleting(found);
                        }}
                        onStatusChange={(id: string, status: 'none' | 'done' | 'tilde') => {
                          if (status === 'tilde') {
                            updateTask(id, { started: true, completed: false, completedAt: null });
                            return;
                          }
                          if (status === 'done') {
                            updateTask(id, {
                              started: false,
                              completed: true,
                              completedAt: new Date().toISOString(),
                            });
                            return;
                          }
                          updateTask(id, { started: false, completed: false, completedAt: null });
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
      <TaskModal
        open={creating}
        onOpenChange={(v) => setCreating(v)}
        initial={{ recurrence: 'daily' }}
        submitLabel="Create Daily"
      />
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
