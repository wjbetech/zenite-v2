'use client';

import React from 'react';
// ...existing code...
import TabsBox from './TabsBox';
import DashboardHeader from './DashboardHeader';
import ImminentList from './ImminentList';
import NewList from './NewList';
import TodayList from './TodayList';
import WeekList from './WeekList';
import type { Task } from '../../lib/taskStore';
import useTaskStore from '../../lib/taskStore';
import { buildActivityFrom, TaskLike } from '../../lib/activityUtils';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import TaskModal from '../modals/TaskModal';
import { useState, useEffect, useRef } from 'react';
import useScrollableTabs from '../../hooks/useScrollableTabs';
import { daysUntil } from '../../lib/date-utils';
import useSettingsStore from '../../lib/settingsStore';
import useDashboardTabs from '../../hooks/useDashboardTabs';
import usePersistedActivity from '../../hooks/usePersistedActivity';

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
  // view state moved into useDashboardTabs hook

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
  const persistedActivity = usePersistedActivity();

  const { activityMap, activityDetails } = React.useMemo(() => {
    return buildActivityFrom(persistedActivity, storeTasks as unknown as TaskLike[]);
  }, [storeTasks, persistedActivity]);
  // Read settings for which views should be shown
  const showNew = useSettingsStore((s) => s.newTasks);
  const showToday = useSettingsStore((s) => s.today);
  const showWeek = useSettingsStore((s) => s.week);
  const showImminent = useSettingsStore((s) => s.imminent);

  const {
    tabs: tabDefs,
    view: effectiveView,
    setView: setEffectiveView,
  } = useDashboardTabs({
    showNew,
    showToday,
    showWeek,
    showImminent,
    initialView: 'new',
  });
  // The hook owns the canonical view state (effectiveView). We will use
  // `effectiveView` throughout the render and call `setEffectiveView` to update it.

  if (!mounted) {
    // render a simple placeholder during SSR so server and client markup match
    return <div className="min-h-[320px]" />;
  }

  return (
    <div
      className="px-6 mt-[124px] flex flex-col flex-1 min-h-0 overflow-x-hidden"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header, heatmap and lists container */}
      <DashboardHeader
        onNewTask={() => {
          setEditing(undefined);
          setModalMode('task');
          setModalOpen(true);
        }}
        onNewProject={() => {
          setEditing(undefined);
          setModalMode('project');
          setModalOpen(true);
        }}
        heatmapOpen={heatmapOpen}
        onHeatmapOpenChange={(v) => {
          console.debug('Dashboard: onOpenChange received', { v });
          setHeatmapOpen(v);
        }}
        activityMap={activityMap}
        activityDetails={activityDetails}
      />

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
            {/* Tabs - horizontally scrollable using TabsBox component */}
            <TabsBox
              tabsRef={tabsRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onScroll={onScroll}
              scrollTabsBy={scrollTabsBy}
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
              didDrag={didDrag}
              tabDefs={tabDefs}
              activeView={effectiveView}
              setView={setEffectiveView}
            />

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
                  {showImminent && effectiveView === 'imminent' && (
                    <React.Suspense>
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
                    </React.Suspense>
                  )}

                  {showNew && effectiveView === 'new' && (
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

                  {showToday && effectiveView === 'today' && (
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

                  {showWeek && effectiveView === 'week' && (
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
