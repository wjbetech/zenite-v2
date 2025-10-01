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
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const tasksLoading = useTaskStore((s) => s.loading);
  const tasksError = useTaskStore((s) => s.error);
  const [heatmapOpen, setHeatmapOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  // On mount, read persisted activity open state from cookie so Dashboard
  // reflects the user's last choice. We do this in an effect to avoid SSR
  // hydration mismatches.
  // track client mount for SSR guard
  useEffect(() => setMounted(true), []);

  // On mount, read persisted activity open state from cookie so Dashboard
  // reflects the user's last choice. We do this in an effect to avoid SSR
  // hydration mismatches.
  useEffect(() => {
    try {
      if (typeof document === 'undefined') return;
      const m = document.cookie.match(new RegExp('(?:^|; )' + 'zenite.activityOpen' + '=([^;]*)'));
      if (m) {
        const v = m[1] === '1';
        if (process.env.NODE_ENV !== 'test')
          console.debug('Dashboard: read persisted heatmapOpen from cookie', { v });
        setHeatmapOpen(v);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.debug('Dashboard: heatmapOpen changed', { heatmapOpen });
    }
  }, [heatmapOpen]);
  // avoid rendering client-only dynamic data during SSR to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

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
  // heatmap controls layout; we no longer vary the item cap per-section

  const newTasks = [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const soonest = [...all]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  // Include daily recurrence tasks in Today and This Week views.
  // Use the canonical `all` ordering and filter so we don't introduce duplicates
  // or change the store ordering.
  const today = [...all].filter((t) => {
    const isDaily = (t.recurrence ?? 'once') === 'daily';
    if (isDaily) return true;
    if (!t.dueDate) return false;
    return daysUntil(t.dueDate) === 0;
  });

  const week = [...all].filter((t) => {
    const isDaily = (t.recurrence ?? 'once') === 'daily';
    if (isDaily) return true;
    if (!t.dueDate) return false;
    const days = daysUntil(t.dueDate);
    return days >= 0 && days <= 6; // this week including today
  });

  // Dev-only diagnostics: guard logs out during tests to keep test output clean
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
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
  const handleStatusChange = React.useCallback(
    async (id: string, status: 'none' | 'done' | 'tilde') => {
      if (process.env.NODE_ENV !== 'test')
        console.log('Dashboard: handleStatusChange', { id, status });
      const nowIso = new Date().toISOString();
      const patch =
        status === 'tilde'
          ? { started: true, completed: false, completedAt: null }
          : status === 'done'
          ? { started: false, completed: true, completedAt: nowIso }
          : { started: false, completed: false, completedAt: null };

      try {
        const updated = await updateTask(id, patch);
        if (process.env.NODE_ENV !== 'test') console.log('Dashboard: updated task', updated);
      } catch (err) {
        console.error('Dashboard: failed to update task status', err);
        const current = useTaskStore.getState().tasks.find((t) => t.id === id) ?? null;
        if (current) {
          const patched = { ...current, ...patch } as Task;
          const next = [...useTaskStore.getState().tasks.filter((t) => t.id !== id), patched];
          setTasks(next);
        }
      }
    },
    [updateTask, setTasks],
  );

  // Build activity map and details from task completions
  const [persistedActivity, setPersistedActivity] = React.useState<
    Record<string, { count: number; titles: string[] }>
  >({});

  React.useEffect(() => {
    // Fetch recent persisted activity (last 90 days) to merge with in-memory task completions
    (async () => {
      try {
        const res = await fetch('/api/activity');
        if (!res.ok) return;
        const rows = (await res.json()) as Array<Record<string, unknown>>;
        const agg: Record<string, { count: number; titles: string[] }> = {};
        for (const r of rows) {
          const date = String(r.date ?? '');
          const title = String(r.taskTitle ?? 'Untitled');
          if (!date) continue;
          if (!agg[date]) agg[date] = { count: 0, titles: [] };
          agg[date].count += 1;
          agg[date].titles.push(title);
        }
        setPersistedActivity(agg);
      } catch {
        // ignore
      }
    })();
  }, []);

  const { activityMap, activityDetails } = React.useMemo(() => {
    const map: Record<string, number> = {};
    const details: Record<string, string[]> = {};
    // Start with persisted snapshots
    for (const [date, info] of Object.entries(persistedActivity)) {
      map[date] = (map[date] || 0) + info.count;
      details[date] = [...(details[date] ?? []), ...info.titles];
    }
    // Merge live task completions
    for (const t of storeTasks) {
      if (!t.completed) continue;
      const when = t.completedAt || t.createdAt;
      if (!when) continue;
      let date: string;
      if (/^\d{4}-\d{2}-\d{2}$/.test(when)) {
        date = when;
      } else {
        const d = new Date(when);
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, '0');
        const day = `${d.getDate()}`.padStart(2, '0');
        date = `${y}-${m}-${day}`;
      }
      map[date] = (map[date] || 0) + 1;
      if (!details[date]) details[date] = [];
      details[date].push(t.title || 'Untitled');
    }
    return { activityMap: map, activityDetails: details };
  }, [storeTasks, persistedActivity]);

  if (!mounted) {
    // render a simple placeholder during SSR so server and client markup match
    return <div className="min-h-[320px]" />;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-x-hidden">
      {tasksLoading && <div className="text-sm text-gray-500 px-4 pt-2">Loading tasks…</div>}
      {tasksError && (
        <div className="px-4 text-sm text-error" role="alert">
          {tasksError}
        </div>
      )}
      <div className="flex items-center justify-between mb-8 px-4 pt-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-md btn-primary border-2 border-base-content flex items-center"
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
            className="btn btn-md btn-secondary border-2 border-base-content flex items-center"
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
      <div className="px-4">
        <ActivityHeatmap
          open={heatmapOpen}
          onOpenChange={(v) => {
            console.debug('Dashboard: onOpenChange received', { v });
            setHeatmapOpen(v);
          }}
          activity={activityMap}
          activityDetails={activityDetails}
        />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setView('new')}
            className={`w-full px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
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
            className={`w-full px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
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
            className={`w-full px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
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
            className={`w-full px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
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

      <div className="flex-1 flex flex-col min-h-0">
        {/* Inner scrollable area that contains only the task lists; it fills remaining space and scrolls */}
        <div className="pt-4 pl-4 pr-4 flex-1 min-h-0 overflow-y-auto pb-10">
          {view === 'imminent' && (
            <TaskSection
              expanded={!heatmapOpen}
              accentClass="border-rose-400"
              tasks={soonest}
              noInnerScroll
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
              noInnerScroll
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

          {view === 'today' &&
            (today.length === 0 ? (
              <TaskSection
                expanded={!heatmapOpen}
                accentClass="border-sky-500"
                tasks={today}
                noInnerScroll
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
                  setTasks(merged);
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
            ))}

          {view === 'week' && (
            <div className="">
              {week.length === 0 ? (
                <TaskSection
                  expanded={!heatmapOpen}
                  accentClass="border-indigo-300"
                  tasks={week}
                  noInnerScroll
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
                <div className="p-0">
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
                      setTasks(merged);
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {all.length === 0 && !tasksLoading && (
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
