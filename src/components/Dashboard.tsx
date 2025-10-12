'use client';

import React from 'react';
// ...existing code...
import { Plus } from 'lucide-react';
import TaskSection from './TaskSection';
import NativeSortableDaily from './NativeSortableDaily';
import ActivityHeatmap from './ActivityHeatmap';
import type { Task } from '../lib/taskStore';
import useTaskStore from '../lib/taskStore';
import DashboardTaskCard from './DashboardTaskCard';
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
  const [heatmapOpen, setHeatmapOpen] = useState(false);
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
        // Track which taskIds the server already reported for each date so we can
        // avoid double-counting local snapshot items that are duplicates.
        const serverSeen: Record<string, Set<string>> = {};
        for (const r of rows) {
          const date = String(r.date ?? '');
          const title = String(r.taskTitle ?? 'Untitled');
          const taskId = String(r.taskId ?? '');
          if (!date) continue;
          if (!agg[date]) agg[date] = { count: 0, titles: [] };
          agg[date].count += 1;
          agg[date].titles.push(title);
          if (taskId) {
            serverSeen[date] = serverSeen[date] ?? new Set();
            serverSeen[date].add(taskId);
          }
        }

        // Merge with any local snapshots; local snapshots are fallbacks when server POST failed.
        // We prefer server data for a given date/taskId, but still include local-only items.
        try {
          if (typeof window !== 'undefined') {
            // find local snapshot keys for last 90 days
            const now = new Date();
            for (let i = 0; i < 90; i++) {
              const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
              const key = `zenite:activity:snapshots:v1:${d.toISOString().slice(0, 10)}`;
              const raw = window.localStorage.getItem(key);
              if (!raw) continue;
              try {
                const items = JSON.parse(raw) as Array<Record<string, unknown>>;
                for (const it of items) {
                  const date = String(it.date ?? d.toISOString().slice(0, 10));
                  const title = String(it.taskTitle ?? 'Untitled');
                  const taskId = String(it.taskId ?? '');
                  // If the server already reported this taskId for the same date, skip it.
                  if (taskId && serverSeen[date] && serverSeen[date].has(taskId)) continue;
                  if (!agg[date]) agg[date] = { count: 0, titles: [] };
                  agg[date].count += 1;
                  agg[date].titles.push(title);
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        } catch {
          // ignore local snapshot errors
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
    // Merge live task completions only into today's bucket so past days remain locked
    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = `${now.getMonth() + 1}`.padStart(2, '0');
    const todayD = `${now.getDate()}`.padStart(2, '0');
    const todayKey = `${todayY}-${todayM}-${todayD}`;
    for (const t of storeTasks) {
      if (!t.completed) continue;
      // Only count live completions that belong to today; previous days must come from persistedActivity
      const when = t.completedAt || t.createdAt;
      if (!when) continue;
      let date: string;
      if (/^\d{4}-\d{2}-\d{2}$/.test(when)) {
        date = when as string;
      } else {
        const d = new Date(when);
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, '0');
        const day = `${d.getDate()}`.padStart(2, '0');
        date = `${y}-${m}-${day}`;
      }
      if (date !== todayKey) continue;
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
    <div className="mx-6 mt-[124px] flex flex-col flex-1 min-h-0 overflow-x-visible max-w-[95%]">
      {/* Wrap header, heatmap and lists in shared px-3 container for alignment */}
      <div className="mx-auto w-full max-w-6xl px-3">
        {/* Header with depth - elevated card with layered backgrounds */}

        <div className="relative flex items-center justify-between pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary-content">Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              className="btn btn-md btn-primary border-2 border-base-content shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center"
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
              className="btn btn-md btn-secondary border-2 border-base-content shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center"
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

        <ActivityHeatmap
          open={heatmapOpen}
          onOpenChange={(v) => {
            console.debug('Dashboard: onOpenChange received', { v });
            setHeatmapOpen(v);
          }}
          activity={activityMap}
          activityDetails={activityDetails}
        />
        {/* moved: view-toggle buttons will be rendered inside the task lists card below */}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Task lists container; ActivityHeatmap intentionally remains outside this background */}
        <div className="px-3 flex-1 min-h-0">
          <div className="mx-auto w-full max-w-6xl">
            {/* Toggle buttons */}
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* New Tasks - primary */}
                <button
                  onClick={() => setView('new')}
                  aria-pressed={view === 'new'}
                  className={`btn w-full btn-primary btn-md border-2 border-base-content transition-all ${
                    view === 'new'
                      ? ''
                      : 'bg-primary/20 text-primary-content/70 hover:bg-primary/30'
                  }`}
                >
                  New Tasks
                </button>

                {/* Today - secondary */}
                <button
                  onClick={() => setView('today')}
                  aria-pressed={view === 'today'}
                  className={`btn w-full btn-secondary btn-md border-2 border-base-content transition-all ${
                    view === 'today'
                      ? ''
                      : 'bg-secondary/18 text-secondary-content/70 hover:bg-secondary/25'
                  }`}
                >
                  Today
                </button>

                {/* This Week - accent */}
                <button
                  onClick={() => setView('week')}
                  aria-pressed={view === 'week'}
                  className={`btn w-full btn-accent btn-md border-2 border-base-content transition-all ${
                    view === 'week' ? '' : 'bg-accent/18 text-accent-content/70 hover:bg-accent/25'
                  }`}
                >
                  This Week
                </button>

                {/* Imminent - warning */}
                <button
                  onClick={() => setView('imminent')}
                  aria-pressed={view === 'imminent'}
                  className={`btn w-full btn-warning btn-md border-2 border-base-content transition-all ${
                    view === 'imminent'
                      ? ''
                      : 'bg-warning/18 text-warning-content/70 hover:bg-warning/25'
                  }`}
                >
                  Imminent
                </button>
              </div>
            </div>

            {/* Task list content */}
            <div className="pt-4 overflow-hidden w-full">
              {tasksLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-center w-full">
                  <svg
                    className="animate-spin h-10 w-10 text-primary"
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
                  <div className="mt-3 text-sm text-gray-500">Fetching tasks…</div>
                </div>
              ) : (
                <>
                  {view === 'imminent' && (
                    <TaskSection
                      expanded={!heatmapOpen}
                      accentClass="border-rose-400"
                      tasks={soonest}
                      noInnerScroll
                      renderRight={(t: Task) => {
                        const days = daysUntil(t.dueDate);
                        const dueLabel =
                          days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
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
                      <div className="pt-2">
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
                            <div className="px-1.5 sm:px-2" key={t.id}>
                              <DashboardTaskCard
                                task={
                                  t as unknown as {
                                    id: string;
                                    title: string;
                                    notes?: string;
                                    completed?: boolean;
                                    started?: boolean;
                                  }
                                }
                                onStatusChange={(id: string, status: 'none' | 'done' | 'tilde') =>
                                  handleStatusChange(id, status)
                                }
                                onEdit={(task) => {
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
                            const dueLabel =
                              days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
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
                        <div className="p-0 pt-2">
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
                              <div className="mb-6 px-1.5 sm:px-2" key={t.id}>
                                <DashboardTaskCard
                                  task={t as unknown as Partial<Task>}
                                  onStatusChange={(id: string, status: 'none' | 'done' | 'tilde') =>
                                    handleStatusChange(id, status)
                                  }
                                  onEdit={(task) => {
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
                </>
              )}

              {/* If there are no tasks at all (and we're not loading), show a centered empty state
                  inside the task-list area so it appears where the lists normally render. If
                  tasksError is present we hint that the DB may be down. */}
              {all.length === 0 && !tasksLoading && (
                <div className="flex items-center justify-center py-24 w-full">
                  <div className="text-center text-base-content/50">
                    <p>
                      {tasksError
                        ? 'Unable to load tasks — the database may be unavailable. Check your local DB and try again, or contact the administrator (wjbetech@gmail.com)'
                        : 'No tasks found — try creating one or contact the administrator (wjbetech@gmail.com)'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
