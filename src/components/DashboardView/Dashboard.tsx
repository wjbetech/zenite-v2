'use client';

import React from 'react';
import DataLoading from '../ui/DataLoading';
// ...existing code...
import TabsBox from './TabsBox';
import TaskViewToggle from '../TaskViewToggle';
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
import EditTaskModal from '../modals/EditTaskModal';
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
  const updateTask = useTaskStore((s) => s.updateTaskOptimistic ?? s.updateTask);
  const setTasks = useTaskStore((s) => s.setTasks);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Task> | undefined>(undefined);
  // editTask holds a full Task when an existing task is being edited via EditTaskModal
  const [editTask, setEditTask] = useState<Task | null>(null);
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
  const newTasks = [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const soonest = [...all]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  // Include daily recurrence tasks in Today and This Week views.
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

  const handleEditSave = (id: string, patch: Partial<Task>) => {
    // Optimistic update: apply edit locally first, then persist via store
    const prev = useTaskStore.getState().tasks.slice();
    const optimistic = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setTasks(optimistic);

    (async () => {
      try {
        await updateTask(id, patch);
      } catch (err) {
        console.error('Dashboard: failed to save edits', err);
        // revert optimistic change on failure
        setTasks(prev);
      } finally {
        setEditTask(null);
      }
    })();
  };

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
        // delegate to store's optimistic implementation
        const updated = await updateTask(id, patch);
        if (process.env.NODE_ENV !== 'test') console.log('Dashboard: updated task', updated);
      } catch (err) {
        console.error('Dashboard: failed to update task status', err);
      }
    },
    [updateTask],
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
      className="px-6 mt-[124px] flex flex-col flex-1 min-h-0 overflow-x-hidden overflow-y-visible relative"
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
      {/* When loading, show a fixed, centered spinner that doesn't affect layout height.
          When not loading, render the task lists container. */}
      {tasksLoading ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <DataLoading label="Fetching tasks…" variant="primary" compact />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tabs and view toggle: keep these outside the scrollable area so they remain fixed */}
          <div
            className="mx-auto w-full relative"
            style={{
              maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)',
              boxSizing: 'border-box',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
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
              </div>
            </div>

            <TaskViewToggle />
          </div>

          {/* Task lists container; ActivityHeatmap intentionally remains outside this background */}
          {/* Make this inner area the only vertical scroll container so header, tabs and toggle stay fixed */}
          <div className="flex-1 min-h-0 overflow-y-auto mb-12">
            <div
              className="mx-auto w-full relative"
              style={{
                maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)',
                boxSizing: 'border-box',
              }}
            >
              {/* Task list content (render spinner OR the lists so they share space).
          Add bottom padding inside the scrollable area so the last TaskCard
          doesn't butt up against the viewport bottom. Because this padding
          lives inside the `overflow-y-auto` scroll container it won't
          increase the page height or create an outer scrollbar. */}
              <div className="pt-4 overflow-visible w-full">
                {showImminent && effectiveView === 'imminent' && (
                  <React.Suspense>
                    <ImminentList
                      tasks={soonest}
                      heatmapOpen={heatmapOpen}
                      onEdit={(t: Partial<Task>) => {
                        const id = t?.id;
                        if (!id) return;
                        const found = storeTasks.find((x) => x.id === id) ?? null;
                        if (found) setEditTask(found);
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
                      const id = t?.id;
                      if (!id) return;
                      const found = storeTasks.find((x) => x.id === id) ?? null;
                      if (found) setEditTask(found);
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
                      const id = t?.id;
                      if (!id) return;
                      const found = storeTasks.find((x) => x.id === id) ?? null;
                      if (found) setEditTask(found);
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
                      const id = t?.id;
                      if (!id) return;
                      const found = storeTasks.find((x) => x.id === id) ?? null;
                      if (found) setEditTask(found);
                    }}
                    onDeleteById={(id: string) => {
                      const found = storeTasks.find((x) => x.id === id) ?? null;
                      setDeleting(found);
                    }}
                    onStatusChange={handleStatusChange}
                  />
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
      )}

      {/* Removed absolute overlay to avoid covering the scrollbar. The scroll
        container now has `mb-12` so its track ends above the page bottom
        while the page height remains unchanged. */}

      <TaskModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setEditing(undefined);
        }}
        initial={editing}
        allowCreateProject={modalMode === 'project'}
      />
      <EditTaskModal
        open={!!editTask}
        onOpenChange={(v) => !v && setEditTask(null)}
        task={editTask}
        onSave={(id, patch) => {
          handleEditSave(id, patch);
        }}
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
