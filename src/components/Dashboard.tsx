'use client';

import React from 'react';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';
import TaskSection from './TaskSection';
import ActivityHeatmap from './ActivityHeatmap';
import type { Task } from './TaskCard';
import useTaskStore from '../lib/taskStore';
import TaskModal from './TaskModal';
import { useState } from 'react';
import { useEffect } from 'react';

type DashboardProps = {
  tasks?: Task[];
};

function daysUntil(date?: string | null) {
  if (!date) return Infinity;
  const d = new Date(date);
  const diff = Math.ceil(
    (d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
  );
  return diff;
}

export default function Dashboard({ tasks }: DashboardProps) {
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

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Task> | undefined>(undefined);
  const [view, setView] = useState<'imminent' | 'new' | 'today' | 'week'>('new');

  const sample: Task[] = [
    {
      id: '1',
      title: 'Finish project brief',
      notes: 'Summarize scope and deliverables',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '2',
      title: 'Daily standup notes',
      dueDate: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      title: 'Plan dailies',
      notes: 'Create recurring tasks for morning routine',
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Respond to client',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    },
  ];

  // merge sample and store tasks by id (store overrides sample)
  const mergedById: Record<string, Task> = {};
  [...(tasks ?? sample), ...storeTasks].forEach((t) => {
    mergedById[t.id] = t;
  });
  const all = Object.values(mergedById).slice(0, 50);
  // decide how many items to show based on whether the heatmap is open
  const extra = heatmapOpen ? 0 : 2; // show 2 more items when heatmap closed

  const newTasks = [...all]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5 + extra);
  const soonest = [...all]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5 + extra);
  const today = [...all]
    .filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      const n = new Date();
      return (
        d.getFullYear() === n.getFullYear() &&
        d.getMonth() === n.getMonth() &&
        d.getDate() === n.getDate()
      );
    })
    .slice(0, 5 + extra);

  const week = [...all]
    .filter((t) => {
      if (!t.dueDate) return false;
      const days = daysUntil(t.dueDate);
      return days >= 0 && days <= 6; // this week including today
    })
    .slice(0, 5 + extra);

  if (!mounted) {
    // render a simple placeholder during SSR so server and client markup match
    return <div className="min-h-[320px]" />;
  }

  return (
    <div className="space-y-6">
      {loading && <div className="text-sm text-gray-500">Loading remote tasks…</div>}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button
          variant="primary"
          className="pr-3"
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
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
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/60 dark:text-emerald-100'
                  : 'bg-transparent text-gray-600 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-pressed={view === 'new'}
            >
              New
            </button>

            <button
              onClick={() => setView('today')}
              className={`w-full text-center cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
                view === 'today'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-800/60 dark:text-sky-100'
                  : 'bg-transparent text-gray-600 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-pressed={view === 'today'}
            >
              Today
            </button>

            <button
              onClick={() => setView('week')}
              className={`w-full text-center cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
                view === 'week'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800/60 dark:text-indigo-100'
                  : 'bg-transparent text-gray-600 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-pressed={view === 'week'}
            >
              This week
            </button>

            <button
              onClick={() => setView('imminent')}
              className={`w-full text-center cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition ${
                view === 'imminent'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-800/60 dark:text-rose-100'
                  : 'bg-transparent text-gray-600 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700'
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
              return <span className="text-xs text-gray-500">{dueLabel}</span>;
            }}
            onEdit={(t) => {
              setEditing(t);
              setModalOpen(true);
            }}
            onDelete={(id) => deleteTask(id)}
          />
        )}

        {view === 'new' && (
          <TaskSection
            expanded={!heatmapOpen}
            accentClass="border-emerald-400"
            tasks={newTasks}
            renderRight={(t: Task) => (
              <span className="text-xs text-gray-400">
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
            )}
            onEdit={(t) => {
              setEditing(t);
              setModalOpen(true);
            }}
            onDelete={(id) => deleteTask(id)}
          />
        )}

        {view === 'today' && (
          <TaskSection
            expanded={!heatmapOpen}
            accentClass="border-sky-500"
            tasks={today}
            renderRight={() => <span className="text-xs text-gray-400">Due today</span>}
            onEdit={(t) => {
              setEditing(t);
              setModalOpen(true);
            }}
            onDelete={(id) => deleteTask(id)}
          />
        )}

        {view === 'week' && (
          <TaskSection
            expanded={!heatmapOpen}
            accentClass="border-indigo-300"
            tasks={week}
            renderRight={(t: Task) => {
              const days = daysUntil(t.dueDate);
              const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
              return <span className="text-xs text-gray-500">{dueLabel}</span>;
            }}
            onEdit={(t) => {
              setEditing(t);
              setModalOpen(true);
            }}
            onDelete={(id) => deleteTask(id)}
          />
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
      />
    </div>
  );
}
