'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';

type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null; // ISO date string
  createdAt: string; // ISO
  completed?: boolean;
};

type DashboardProps = {
  tasks?: Task[];
};

// 3D clickable task card
function TaskCard({ task, href, right }: { task: Task; href?: string; right?: React.ReactNode }) {
  return (
    <Link href={href ?? '#'} className="group block" aria-label={task.title}>
      <div className="relative">
        {/* offset layer for depth */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200" />

        {/* main card */}
        <div className="relative z-10 bg-white rounded-lg p-4 shadow-md transform transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-[1.01]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900">{task.title}</div>
              {task.notes && <div className="text-xs text-gray-500 mt-1">{task.notes}</div>}
            </div>
            {right && <div className="text-xs text-gray-400 ml-4">{right}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function daysUntil(date?: string | null) {
  if (!date) return Infinity;
  const now = new Date();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/tasks/new">
          <Button variant="primary">New Task</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            <span className="inline-block border-b-4 border-rose-400 pb-0.5">Imminent tasks</span>
          </h2>
          <ul className="space-y-3 perspective-[1000px]">
            {soonest.length === 0 && (
              <li className="text-sm text-gray-400">No imminent deadlines.</li>
            )}
            {soonest.map((t) => {
              const days = daysUntil(t.dueDate);
              const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
              return (
                <li key={t.id}>
                  <TaskCard
                    task={t}
                    href={`/tasks/${t.id}`}
                    right={<span className="text-xs text-gray-500">{dueLabel}</span>}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            <span className="inline-block border-b-4 border-emerald-400 pb-0.5">Newly created</span>
          </h2>
          <ul className="space-y-3 perspective-[1000px]">
            {newTasks.length === 0 && <li className="text-sm text-gray-400">No recent tasks.</li>}
            {newTasks.map((t) => (
              <li key={t.id}>
                <TaskCard
                  task={t}
                  href={`/tasks/${t.id}`}
                  right={
                    <span className="text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="min-h-[260px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">
            <span className="inline-block border-b-4 border-indigo-300 pb-0.5">Today</span>
          </h2>
          <span className="text-xs text-gray-500">
            {today.length} item{today.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ul className="space-y-3 perspective-[1000px]">
          {today.length === 0 && <li className="text-sm text-gray-400">No tasks for today.</li>}
          {today.map((t) => (
            <li key={t.id}>
              <TaskCard
                task={t}
                href={`/tasks/${t.id}`}
                right={<span className="text-xs text-gray-400">Due today</span>}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
