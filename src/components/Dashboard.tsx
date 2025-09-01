'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import TaskSection from './TaskSection';
import type { Task } from './TaskCard';

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

  const all = tasks ?? sample;
  const newTasks = [...all]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const soonest = [...all]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);
  const today = [...all].filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/tasks/new">
          <Button variant="primary">New Task</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <TaskSection
          title="Imminent tasks"
          accentClass="border-rose-400"
          tasks={soonest}
          renderRight={(t: Task) => {
            const days = daysUntil(t.dueDate);
            const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
            return <span className="text-xs text-gray-500">{dueLabel}</span>;
          }}
        />

        <div className=" md:mt-0">
          <TaskSection
            title="Newly created"
            accentClass="border-emerald-400"
            tasks={newTasks}
            renderRight={(t: Task) => (
              <span className="text-xs text-gray-400">
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
            )}
          />
        </div>
      </div>

      <section className="min-h-[260px]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700 dark:text-white">
            <span className="inline-block border-b-4 border-sky-500 pb-0.5 mb-3">
              Today&apos;s tasks
            </span>
          </h2>
          <span className="text-xs text-gray-500">
            {today.length} item{today.length !== 1 ? 's' : ''}
          </span>
        </div>
        <TaskSection
          accentClass="border-sky-500"
          tasks={today}
          renderRight={() => <span className="text-xs text-gray-400">Due today</span>}
        />
      </section>
    </div>
  );
}
