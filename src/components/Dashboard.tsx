'use client';

import React from 'react';
// ...existing code...
import { Plus } from 'lucide-react';
import TaskSection from './TaskSection';
import NativeSortableDaily from './NativeSortableDaily';
import ActivityHeatmap from './ActivityHeatmap';
import type { Task } from '../lib/taskStore';
import useTaskStore from '../lib/taskStore';
import DailyTaskCard from './DailyTaskCard';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TaskModal from './TaskModal';
import { useState } from 'react';
import { useEffect } from 'react';

function daysUntil(date?: string | null) {
  if (!date) return Infinity;
  const d = new Date(date);
  const now = new Date();
  // compute date-only UTC timestamps to avoid local timezone shifting seeded ISO dates
  const dUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = Math.ceil((dUtc - nowUtc) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Dashboard() {
  const storeTasks = useTaskStore((s) => s.tasks);

  const loadRemote = useTaskStore(
    (s) => (s as unknown as { loadRemote?: () => Promise<void> }).loadRemote,
  );
  const [loading, setLoading] = useState(false);
  const [heatmapOpen, setHeatmapOpen] = useState(true);
  // avoid rendering client-only dynamic data during SSR to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function start() {
      // Only load remote tasks when explicitly requested via env + store helper.
      if (process.env.NEXT_PUBLIC_USE_REMOTE_DB === 'true' && loadRemote) {
        try {
          setLoading(true);
          await loadRemote();
        } catch (err) {
          console.warn('failed to load remote tasks', err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    }
    start();
    return () => {
      mounted = false;
    };
  }, [loadRemote]);

  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const setTasks = useTaskStore((s) => s.setTasks);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Task> | undefined>(undefined);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'task' | 'project'>('task');
  const [view, setView] = useState<'imminent' | 'new' | 'today' | 'week'>('new');

  // derive `all` directly from the store to preserve the global ordering
  // (storeTasks is the canonical ordered list; use it as the source of truth)
  const all = [...storeTasks].slice(0, 50);
  // decide how many items to show based on whether the heatmap is open
  const extra = heatmapOpen ? 0 : 2; // show 2 more items when heatmap closed

  const newTasks = [...all]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5 + extra);
  const soonest = [...all]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5 + extra);
  const today = [...all].filter((t) => t.dueDate && daysUntil(t.dueDate) === 0).slice(0, 5 + extra);

  const week = [...all]
    .filter((t) => {
      if (!t.dueDate) return false;
      const days = daysUntil(t.dueDate);
      return days >= 0 && days <= 6; // this week including today
    })
    .slice(0, 5 + extra);

  // Dev-only diagnostics: log store and computed buckets so we can see why Today/Week may be empty
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        'Dashboard: diagnostics -> storeTasks=',
        storeTasks.length,
        'all=',
        all.length,
        'today=',
        today.length,
        'week=',
        week.length,
      );
      if (today.length > 0)
        console.log(
          'Dashboard: today ids',
          today.map((t) => t.id),
        );
      if (week.length > 0)
        console.log(
          'Dashboard: week ids',
          week.map((t) => t.id),
        );

      if (today.length === 0 && week.length === 0) {
        console.log('Dashboard: detailed storeTasks dump (first 20):');
        storeTasks.slice(0, 20).forEach((t, i) => {
          try {
            console.log(i, {
              id: t.id,
              title: t.title,
              dueDate: t.dueDate,
              daysUntil: daysUntil(t.dueDate),
            });
          } catch {
            console.log('err dumping task', i, t && t.id);
          }
        });
      }
    }
  }, [storeTasks.length, all.length, today, week, storeTasks]);
  const handleStatusChange = (id: string, status: 'none' | 'done' | 'tilde') => {
    console.log('Dashboard: handleStatusChange', { id, status });
    const patch =
      status === 'tilde'
        ? { started: true, completed: false }
        : status === 'done'
        ? { started: false, completed: true }
        : { started: false, completed: false };

    const updated = updateTask(id, patch);
    console.log('Dashboard: updated task', updated);

    // If the task wasn't in the store (updateTask returned undefined), fallback
    // to adding the patched task into the store so UI reflects the change.
    if (!updated) {
      const base = storeTasks.find((t) => t.id === id) ?? null;
      if (base) {
        const patched = { ...base, ...patch } as Task;
        // avoid duplicate ids
        const next = [...storeTasks.filter((t) => t.id !== id), patched];
        setTasks(next);
        console.log('Dashboard: fallback setTasks added', patched);
      }
    }
  };

  if (!mounted) {
    // render a simple placeholder during SSR so server and client markup match
    return <div className="min-h-[320px]" />;
  }

  return (
    <div className="space-y-6">
      {loading && <div className="text-sm text-gray-500">Loading remote tasks…</div>}
      <div className="flex items-center justify-between mb-10 pl-4 pr-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-md btn-primary flex items-center"
            type="button"
            onClick={() => {
              setEditing(undefined);
              setModalMode('task');
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </button>
          <button
            className="btn btn-md btn-secondary flex items-center"
            type="button"
            onClick={() => {
              setEditing(undefined);
              setModalMode('project');
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Activity heatmap under the title */}
      <div className="mb-10">
        <ActivityHeatmap onOpenChange={(open: boolean) => setHeatmapOpen(open)} />
      </div>

      {/* Menu panel and list wrapper so menu buttons and cards align on the left */}
      <div className="pl-4">
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setView('new')}
              className={`w-full text-center cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
                view === 'new'
                  ? 'bg-success text-success-content'
                  : 'bg-transparent text-gray-600 hover:bg-base-200'
              }`}
              aria-pressed={view === 'new'}
            >
              New Tasks
            </button>

            <button
              onClick={() => setView('today')}
              className={`w-full text-center cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
                view === 'today'
                  ? 'bg-info text-info-content'
                  : 'bg-transparent text-gray-600 hover:bg-info hover:text-info-content'
              }`}
              aria-pressed={view === 'today'}
            >
              Today
            </button>

            <button
              onClick={() => setView('week')}
              className={`w-full text-center cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
                view === 'week'
                  ? 'bg-primary text-primary-content'
                  : 'bg-transparent text-gray-600 hover:bg-primary hover:text-primary-content'
              }`}
              aria-pressed={view === 'week'}
            >
              This Week
            </button>

            <button
              onClick={() => setView('imminent')}
              className={`w-full text-center cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
                view === 'imminent'
                  ? 'bg-error text-error-content'
                  : 'bg-transparent text-gray-600 hover:bg-error hover:text-error-content'
              }`}
              aria-pressed={view === 'imminent'}
            >
              Imminent
            </button>
          </div>
        </div>
      </div>
      {/* Single list area that switches based on selected view */}
      <div>
        {view === 'imminent' && (
          <TaskSection
            expanded={!heatmapOpen}
            accentClass="border-rose-400"
            tasks={soonest}
            renderRight={(t: Task) => {
              const days = daysUntil(t.dueDate);
              const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
              return <span className="text-xs text-gray-100">{dueLabel}</span>;
            }}
            onEdit={(t) => {
              setEditing(t);
              setModalOpen(true);
            }}
            onDelete={(id) => {
              const found = storeTasks.find((x) => x.id === id) ?? null;
              setDeleting(found);
            }}
            onStatusChange={handleStatusChange}
          />
        )}

        {view === 'new' && (
          <TaskSection
            expanded={!heatmapOpen}
            accentClass="border-emerald-400"
            tasks={newTasks}
            renderRight={(t: Task) => (
              <span className="text-xs text-white">
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
            )}
            onEdit={(t) => {
              setEditing(t);
              setModalOpen(true);
            }}
            onDelete={(id) => {
              const found = storeTasks.find((x) => x.id === id) ?? null;
              setDeleting(found);
            }}
            onStatusChange={handleStatusChange}
          />
        )}

        {view === 'today' && (
          <div className="pl-4 pr-4">
            {today.length === 0 ? (
              <TaskSection
                expanded={!heatmapOpen}
                accentClass="border-sky-500"
                tasks={today}
                renderRight={() => <span className="text-xs text-gray-100">Due today</span>}
                onEdit={(t) => {
                  setEditing(t);
                  setModalOpen(true);
                }}
                onDelete={(id) => deleteTask(id)}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <NativeSortableDaily
                items={today.map((t) => ({
                  id: t.id,
                  title: t.title,
                  notes: t.notes,
                  started: !!t.started,
                  completed: !!t.completed,
                  // omit `href` in draggable lists so the card isn't wrapped with an anchor
                }))}
                onReorder={(next) => {
                  const idOrder = next.map((n) => n.id);
                  const reordered = idOrder
                    .map((id) => storeTasks.find((t) => t.id === id))
                    .filter(Boolean) as typeof storeTasks;
                  // Determine the original positions of the subset within the global store
                  const positions: number[] = [];
                  const idSet = new Set(idOrder);
                  storeTasks.forEach((t, idx) => {
                    if (idSet.has(t.id)) positions.push(idx);
                  });
                  // Place reordered items back into their original indices
                  const merged = [...storeTasks];
                  for (let i = 0; i < positions.length; i++) {
                    const pos = positions[i];
                    merged[pos] = reordered[i] || merged[pos];
                  }
                  useTaskStore.getState().setTasks(merged);
                }}
                renderItem={(t: {
                  id: string;
                  title: string;
                  notes?: string;
                  started?: boolean;
                  completed?: boolean;
                  href?: string;
                }) => (
                  <div className="mb-6" key={t.id}>
                    <DailyTaskCard
                      task={{
                        id: t.id,
                        title: t.title,
                        notes: t.notes,
                        completed: !!t.completed,
                        started: !!t.started,
                        href: t.href as string | undefined,
                        projectName: undefined,
                      }}
                      onToggle={(id: string) => {
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        const started = !!found?.started;
                        const completed = !!found?.completed;
                        // cycle: none -> started -> done -> none
                        const next =
                          !started && !completed
                            ? 'tilde'
                            : started && !completed
                            ? 'done'
                            : 'none';
                        handleStatusChange(id, next as 'none' | 'done' | 'tilde');
                      }}
                      onEdit={(task: { id: string }) => {
                        const found = storeTasks.find((x) => x.id === task.id) ?? null;
                        if (found) {
                          setEditing(found);
                          setModalOpen(true);
                        }
                      }}
                      onDelete={(id: string) => {
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        setDeleting(found);
                      }}
                    />
                  </div>
                )}
                containerClassName="space-y-6 md:space-y-7 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-6"
              />
            )}
          </div>
        )}

        {view === 'week' && (
          <div className="pl-4 pr-4">
            {week.length === 0 ? (
              <TaskSection
                expanded={!heatmapOpen}
                accentClass="border-indigo-300"
                tasks={week}
                renderRight={(t: Task) => {
                  const days = daysUntil(t.dueDate);
                  const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
                  return <span className="text-xs text-gray-100">{dueLabel}</span>;
                }}
                onEdit={(t) => {
                  setEditing(t);
                  setModalOpen(true);
                }}
                onDelete={(id) => {
                  const found = storeTasks.find((x) => x.id === id) ?? null;
                  setDeleting(found);
                }}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <NativeSortableDaily
                items={week.map((t) => ({
                  id: t.id,
                  title: t.title,
                  notes: t.notes,
                  started: !!t.started,
                  completed: !!t.completed,
                  // omit `href` in draggable lists so the card isn't wrapped with an anchor
                }))}
                onReorder={(next) => {
                  const idOrder = next.map((n) => n.id);
                  const reordered = idOrder
                    .map((id) => storeTasks.find((t) => t.id === id))
                    .filter(Boolean) as typeof storeTasks;
                  const positions: number[] = [];
                  const idSet = new Set(idOrder);
                  storeTasks.forEach((t, idx) => {
                    if (idSet.has(t.id)) positions.push(idx);
                  });
                  const merged = [...storeTasks];
                  for (let i = 0; i < positions.length; i++) {
                    const pos = positions[i];
                    merged[pos] = reordered[i] || merged[pos];
                  }
                  useTaskStore.getState().setTasks(merged);
                }}
                renderItem={(t: {
                  id: string;
                  title: string;
                  notes?: string;
                  started?: boolean;
                  completed?: boolean;
                  href?: string;
                }) => (
                  <div className="mb-6" key={t.id}>
                    <DailyTaskCard
                      task={{
                        id: t.id,
                        title: t.title,
                        notes: t.notes,
                        completed: !!t.completed,
                        started: !!t.started,
                        href: t.href as string | undefined,
                        projectName: undefined,
                      }}
                      onToggle={(id: string) => {
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        const started = !!found?.started;
                        const completed = !!found?.completed;
                        // cycle: none -> started -> done -> none
                        const next =
                          !started && !completed
                            ? 'tilde'
                            : started && !completed
                            ? 'done'
                            : 'none';
                        handleStatusChange(id, next as 'none' | 'done' | 'tilde');
                      }}
                      onEdit={(task: { id: string }) => {
                        const found = storeTasks.find((x) => x.id === task.id) ?? null;
                        if (found) {
                          setEditing(found);
                          setModalOpen(true);
                        }
                      }}
                      onDelete={(id: string) => {
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        setDeleting(found);
                      }}
                    />
                  </div>
                )}
                containerClassName="space-y-6 md:space-y-7 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-6"
              />
            )}
          </div>
        )}
      </div>
      {all.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          No tasks found — try creating one or enable the remote DB.
        </div>
      )}
      <TaskModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setEditing(undefined);
        }}
        initial={editing}
        allowCreateProject={modalMode === 'project'}
      />
      <ConfirmDeleteModal
        open={!!deleting}
        itemTitle={deleting?.title}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          deleteTask(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
