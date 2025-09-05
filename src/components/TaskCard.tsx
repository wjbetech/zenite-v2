'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash, Check } from 'lucide-react';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  createdAt: string;
  completed?: boolean;
  started?: boolean;
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
  // derive a simple status from task flags; prefer explicit task props
  const isDone = !!task.completed;
  const isStarted = !!task.started && !isDone;

  const cycleStatus = () => {
    // Order: none -> started -> done -> none
    if (!isStarted && !isDone) {
      // start
      onStatusChange?.(task.id, 'tilde');
      return;
    }
    if (isStarted && !isDone) {
      // complete
      onStatusChange?.(task.id, 'done');
      return;
    }
    // clear
    onStatusChange?.(task.id, 'none');
  };

  // Use CSS variable for neutral-content as the default card background so it
  // matches the DaisyUI theme token across themes.
  const bgClass = isDone ? 'bg-gray-400/50' : isStarted ? 'bg-neutral' : '';

  const bgStyle =
    !isDone && !isStarted
      ? { backgroundColor: 'hsl(var(--nc) / var(--tw-bg-opacity, 1))' }
      : undefined;

  const borderClass = isDone ? 'border-gray-500' : isStarted ? 'border-info' : 'border-base-200';

  const buttonClass = isDone
    ? 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-gray-400 bg-gray-200 text-sm cursor-pointer text-gray-600'
    : isStarted
    ? 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-info text-sm cursor-pointer text-info-content'
    : 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-base-300 text-sm cursor-pointer';

  const cardInner = (
    <div
      style={bgStyle}
      className={`${bgClass} relative z-10 rounded-md shadow-sm border ${borderClass} p-2 transition-transform duration-150 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-200 cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="text-base md:text-md lg:text-lg font-medium dark:text-white">
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
                title={isDone ? 'Clear status' : isStarted ? 'Mark done' : 'Mark in progress'}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-neutral-content" strokeWidth={2} />
                ) : isStarted ? (
                  <span className="text-sm font-bold">•</span>
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
            {right && <div className="text-sm md:text-base text-neutral-content">{right}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Single slab (chunky 3D base / shadow) */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-md bg-base-200 dark:bg-base-300 border border-gray-200/20 dark:border-zinc-900 z-0" />

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
