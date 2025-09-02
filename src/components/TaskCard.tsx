'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash, Check } from 'lucide-react';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  createdAt: string;
  completed?: boolean;
};

type Props = {
  task: Task;
  right?: React.ReactNode;
  href?: string;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

export default function TaskCard({ task, right, href, onEdit, onDelete, onStatusChange }: Props) {
  const [status, setStatus] = useState<'none' | 'done' | 'tilde'>('none');

  const cycleStatus = () => {
    // Order: none -> tilde (in-progress) -> done -> none
    const next = status === 'none' ? 'tilde' : status === 'tilde' ? 'done' : 'none';
    setStatus(next);
    onStatusChange?.(task.id, next);
  };

  const bgClass =
    status === 'done'
      ? 'bg-emerald-500/25'
      : status === 'tilde'
      ? 'bg-amber-500/25'
      : 'bg-white dark:bg-gray-800';

  // border color for the card depending on status
  const borderClass =
    status === 'done'
      ? 'border-emerald-600 dark:border-emerald-700'
      : status === 'tilde'
      ? 'border-amber-600 dark:border-amber-700'
      : 'border-gray-100 dark:border-zinc-500';

  // class for the small status toggle button so it matches the status color
  const buttonClass =
    status === 'done'
      ? 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-emerald-700 bg-emerald-100 dark:bg-emerald-900 text-sm cursor-pointer'
      : status === 'tilde'
      ? 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-amber-700 bg-amber-100 dark:bg-amber-900 text-sm cursor-pointer'
      : 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-gray-700 text-sm cursor-pointer';

  const cardInner = (
    <div
      className={`${bgClass} relative z-10 rounded-md shadow-sm border ${borderClass} p-2 transition-transform duration-150 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-200 cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="text-base md:text-md lg:text-lg font-medium text-gray-900 dark:text-white">
                {task.title}
              </div>

              <button
                aria-label="Toggle task status"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  cycleStatus();
                }}
                className={buttonClass}
                title={
                  status === 'none'
                    ? 'Mark in progress'
                    : status === 'tilde'
                    ? 'Mark done'
                    : 'Clear status'
                }
              >
                {status === 'done' ? (
                  // dark green for completed
                  <Check
                    className="h-4 w-4 text-emerald-800 dark:text-emerald-300"
                    strokeWidth={2}
                  />
                ) : status === 'tilde' ? (
                  // dark orange for in-progress/tilde
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-300">~</span>
                ) : null}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {onEdit && (
                <button
                  aria-label="Edit task"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onEdit(task);
                  }}
                  className="cursor-pointer text-emerald-500 hover:text-emerald-500/80"
                  title="Edit"
                >
                  <Edit className="h-5 w-5" />
                </button>
              )}

              {onDelete && (
                <button
                  aria-label="Delete task"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(task.id);
                  }}
                  className="cursor-pointer text-red-400 hover:text-red-400/80"
                  title="Delete"
                >
                  <Trash className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start mt-1">
            {right && (
              <div className="text-sm md:text-base text-gray-400 dark:text-white">{right}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Single slab (chunky 3D base / shadow) */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200/20 dark:border-zinc-900 z-0" />

      {href ? (
        <Link href={href} className="block">
          {cardInner}
        </Link>
      ) : (
        cardInner
      )}
    </div>
  );
}
