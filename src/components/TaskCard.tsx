'use client';

import React from 'react';
import Link from 'next/link';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  createdAt: string;
  completed?: boolean;
};

export default function TaskCard({
  task,
  href,
  right,
}: {
  task: Task;
  href?: string;
  right?: React.ReactNode;
}) {
  return (
    <Link href={href ?? '#'} className="group block" aria-label={task.title}>
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200 dark:from-slate-800 dark:to-slate-700" />

        <div className="relative z-10 bg-white rounded-lg px-2 py-4 shadow-md transform transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-[1.01] dark:bg-slate-800 dark:border dark:border-slate-700 dark:shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
              {task.notes && (
                <div className="text-xs text-gray-500 mt-1 dark:text-white/80">{task.notes}</div>
              )}
            </div>
            {right && <div className="text-xs text-gray-400 ml-4 dark:text-white">{right}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
}
