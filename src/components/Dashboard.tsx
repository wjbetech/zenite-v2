'use client';

import React from 'react';
// ...existing code...
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import ActivityHeatmap from './ActivityHeatmap';
import ImminentList from './DashboardView/ImminentList';
import NewList from './DashboardView/NewList';
import TodayList from './DashboardView/TodayList';
import WeekList from './DashboardView/WeekList';
import type { Task } from '../lib/taskStore';
import useTaskStore from '../lib/taskStore';
import { buildActivityFrom, TaskLike } from '../lib/activityUtils';
// removed unused imports: DashboardTaskCard, useProjectStore
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TaskModal from './TaskModal';
import { useState, useEffect, useRef } from 'react';
import useSettingsStore from '../lib/settingsStore';
import useScrollableTabs from '../hooks/useScrollableTabs';
import { daysUntil } from '../lib/date-utils';

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

  // Tabs scroll + drag refs/state (extracted to hook)
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onScroll,
    scrollTabsBy,
    canScrollLeft,
    canScrollRight,
    didDrag,
  } = useScrollableTabs(tabsRef);

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
    return buildActivityFrom(persistedActivity, storeTasks as unknown as TaskLike[]);
  }, [storeTasks, persistedActivity]);
  // Read settings for which views should be shown
  const showNew = useSettingsStore((s) => s.newTasks);
  const showToday = useSettingsStore((s) => s.today);
  const showWeek = useSettingsStore((s) => s.week);
  const showImminent = useSettingsStore((s) => s.imminent);

  // Define tabs in a single place so we can insert dividers between visible tabs
  type View = 'imminent' | 'new' | 'today' | 'week';
  const tabDefs: Array<{ id: View; show: boolean; label: string; minClass: string }> = [
    { id: 'new', show: showNew, label: 'New Tasks', minClass: 'min-w-[200px] sm:min-w-[240px]' },
    { id: 'today', show: showToday, label: 'Today', minClass: 'min-w-[200px] sm:min-w-[240px]' },
    { id: 'week', show: showWeek, label: 'This Week', minClass: 'min-w-[200px] sm:min-w-[240px]' },
    {
      id: 'imminent',
      show: showImminent,
      label: 'Imminent',
      minClass: 'min-w-[180px] sm:min-w-[220px]',
    },
  ];

  // If the current view is disabled in settings, pick the first enabled view (priority: new, today, week, imminent)
  useEffect(() => {
    const enabled = {
      new: showNew,
      today: showToday,
      week: showWeek,
      imminent: showImminent,
    } as Record<string, boolean>;
    if (!enabled[view]) {
      if (showNew) setView('new');
      else if (showToday) setView('today');
      else if (showWeek) setView('week');
      else if (showImminent) setView('imminent');
    }
  }, [showNew, showToday, showWeek, showImminent, view]);

  if (!mounted) {
    // render a simple placeholder during SSR so server and client markup match
    return <div className="min-h-[320px]" />;
  }

  return (
    <div
      className="px-6 mt-[124px] flex flex-col flex-1 min-h-0 overflow-x-hidden"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Wrap header, heatmap and lists in a centered container; use no extra inner padding so the title sits flush with the outer padding */}
      <div
        className="mx-auto w-full px-0"
        style={{ maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)', boxSizing: 'border-box' }}
      >
        <div className="relative pb-6">
          {/*
            On small screens we want the title centered with the action buttons
            stacked under it. On md and up, keep the original layout with title
            left and buttons inline on the right.
          */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between items-center gap-3">
            <h1 className="display-font text-3xl font-semibold tracking-tight text-emerald-600 text-center md:text-left">
              Dashboard
            </h1>

            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mb-8 md:mb-0">
              <button
                className="btn btn-md btn-primary border-2 border-primary-content text-primary-content shadow-lg hover:shadow-xl transition-all duration-200 flex items-center w-full md:w-auto"
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
                className="btn btn-md btn-accent border-2 border-accent-content text-accent-content shadow-lg hover:shadow-xl transition-all duration-200 flex items-center w-full md:w-auto"
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

          <div className="hidden lg:block">
            <ActivityHeatmap
              open={heatmapOpen}
              onOpenChange={(v) => {
                console.debug('Dashboard: onOpenChange received', { v });
                setHeatmapOpen(v);
              }}
              activity={activityMap}
              activityDetails={activityDetails}
            />
          </div>
        </div>

        {/* moved: view-toggle buttons will be rendered inside the task lists card below */}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Task lists container; ActivityHeatmap intentionally remains outside this background */}
        <div className="flex-1 min-h-0">
          <div
            className="mx-auto w-full"
            style={{
              maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)',
              boxSizing: 'border-box',
            }}
          >
            {/* Tabs - horizontally scrollable using daisyUI tabs-box + arrows */}
            <div className="mb-4">
              <div className="mx-auto w-full">
                <div className="tabs tabs-box bg-base-300 w-full flex items-center">
                  <div className="flex-none px-1">
                    <button
                      type="button"
                      aria-label="Scroll tabs left"
                      onClick={() => scrollTabsBy(-220)}
                      className="btn btn-ghost btn-sm pointer-events-auto h-8 w-8 p-0 flex items-center justify-center text-base-content"
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>

                  <div
                    ref={tabsRef}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onScroll={onScroll}
                    className="overflow-x-auto no-scrollbar flex items-center flex-nowrap whitespace-nowrap flex-1 px-3"
                    role="tablist"
                    aria-label="Task view tabs"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      scrollSnapType: 'x mandatory' as const,
                    }}
                  >
                    {tabDefs
                      .filter((t) => t.show)
                      .map((t, i, arr) => {
                        const isActive = view === t.id;
                        const isLast = i === arr.length - 1;
                        return (
                          <React.Fragment key={t.id}>
                            {/* Make each tab wrapper a flex item that can grow on md+ and snap on small screens.
                                Apply the per-tab minimum width here so the button itself doesn't overflow and cover siblings. */}
                            <div
                              className={`flex items-center flex-none min-w-full md:flex-1 md:min-w-0 ${t.minClass}`}
                              style={{ scrollSnapAlign: 'start' as const }}
                            >
                              <button
                                role="tab"
                                aria-selected={isActive}
                                onClick={(e) => {
                                  // Prevent click-through when user was dragging the tabs
                                  if (didDrag.current) {
                                    // Stop the click from doing anything
                                    e.stopPropagation();
                                    e.preventDefault();
                                    return;
                                  }
                                  setView(t.id);
                                }}
                                className={`tab tab-lg w-full text-center ${
                                  isActive
                                    ? 'tab-active bg-base-100 text-base-content'
                                    : 'text-base-content'
                                } border-0`}
                              >
                                {t.label}
                              </button>
                            </div>

                            {!isLast && (
                              // Render the divider as its own non-growing flex item so it always sits between tab wrappers
                              <div className="hidden md:flex items-center flex-none" aria-hidden>
                                <span className="mx-3 h-6 w-[2px] bg-gray-300 flex-shrink-0" />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <div className="flex-none px-1">
                    <button
                      type="button"
                      aria-label="Scroll tabs right"
                      onClick={() => scrollTabsBy(220)}
                      className="btn btn-ghost btn-sm pointer-events-auto h-8 w-8 p-0 flex items-center justify-center text-base-content"
                      disabled={!canScrollRight}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
                  {showImminent && view === 'imminent' && (
                    <ImminentList
                      tasks={soonest}
                      heatmapOpen={heatmapOpen}
                      onEdit={(t: Partial<Task>) => {
                        setEditing(t);
                        setModalOpen(true);
                      }}
                      onDeleteById={(id: string) => {
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        setDeleting(found);
                      }}
                      onStatusChange={handleStatusChange}
                    />
                  )}

                  {showNew && view === 'new' && (
                    <NewList
                      tasks={newTasks}
                      heatmapOpen={heatmapOpen}
                      onEdit={(t: Partial<Task>) => {
                        setEditing(t);
                        setModalOpen(true);
                      }}
                      onDeleteById={(id: string) => {
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        setDeleting(found);
                      }}
                      onStatusChange={handleStatusChange}
                    />
                  )}

                  {showToday && view === 'today' && (
                    <TodayList
                      tasks={today}
                      heatmapOpen={heatmapOpen}
                      storeTasks={storeTasks}
                      setTasks={setTasks}
                      onEdit={(t: Partial<Task>) => {
                        setEditing(t);
                        setModalOpen(true);
                      }}
                      onDeleteById={(id: string) => deleteTask(id)}
                      onStatusChange={handleStatusChange}
                    />
                  )}

                  {showWeek && view === 'week' && (
                    <WeekList
                      tasks={week}
                      heatmapOpen={heatmapOpen}
                      storeTasks={storeTasks}
                      setTasks={setTasks}
                      onEdit={(t: Partial<Task>) => {
                        setEditing(t);
                        setModalOpen(true);
                      }}
                      onDeleteById={(id: string) => {
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        setDeleting(found);
                      }}
                      onStatusChange={handleStatusChange}
                    />
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
