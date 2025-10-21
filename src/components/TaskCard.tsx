'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash, Check, Play } from 'lucide-react';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  createdAt: string;
  completed?: boolean;
  started?: boolean;
  recurrence?: string | null;
  completedAt?: string | null;
  estimatedDuration?: number | null;
};

type Props = {
  task: Task;
  right?: React.ReactNode;
  href?: string;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

// Small helper to compute classes per status so intent is clear
function getStatusClasses(isStarted: boolean, isDone: boolean) {
  // Keep the token choices and sizing consistent with DailyTaskCard so
  // the status control looks identical (button carries the color tokens
  // and icons inherit color from the button).
  if (!isStarted && !isDone) {
    return {
      wrapper: 'bg-base-200 text-base-content',
      border: 'border-transparent',
      // base button shape (colors applied separately so icons inherit)
      buttonBase:
        'flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors cursor-pointer',
      buttonState: 'bg-white border',
      dot: 'bg-neutral',
      text: 'text-base-content',
    };
  }

  if (isStarted && !isDone) {
    return {
      wrapper: 'bg-accent/10 text-accent-content',
      border: 'border-transparent',
      buttonBase:
        'flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors cursor-pointer',
      buttonState: 'bg-accent text-accent-content',
      dot: 'bg-accent-content',
      text: 'text-accent-content dark:text-accent',
    };
  }

  // done (completed)
  return {
    wrapper: 'bg-success/10 text-success-content',
    border: 'border-transparent',
    buttonBase:
      'flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors cursor-pointer',
    buttonState: 'bg-success text-success-content',
    dot: 'bg-success-content',
    text: 'text-success-content dark:text-success',
  };
}

export default function TaskCard({ task, right, href, onEdit, onDelete, onStatusChange }: Props) {
  const isDone = !!task.completed;
  const isStarted = !!task.started && !isDone;

  const {
    wrapper: bgClass,
    buttonBase,
    buttonState,
    dot: dotClass,
    text: textClass,
  } = getStatusClasses(isStarted, isDone);

  // Determine if this is a one-off completed task completed on a previous day
  let isStaleCompleted = false;
  try {
    if (task.completed && !(task.recurrence === 'daily' || task.recurrence === 'weekly')) {
      if (task.completedAt) {
        const comp = new Date(task.completedAt);
        const now = new Date();
        if (
          comp.getFullYear() !== now.getFullYear() ||
          comp.getMonth() !== now.getMonth() ||
          comp.getDate() !== now.getDate()
        ) {
          isStaleCompleted = true;
        }
      }
    }
  } catch {
    // ignore
  }

  const finalWrapper = isStaleCompleted ? 'bg-red-500/20 text-red-700' : bgClass;

  const cycleStatus = () => {
    if (!isStarted && !isDone) {
      onStatusChange?.(task.id, 'tilde');
      return;
    }
    if (isStarted && !isDone) {
      onStatusChange?.(task.id, 'done');
      return;
    }
    onStatusChange?.(task.id, 'none');
  };

  const cardInner = (
    <div
      role="article"
      aria-label={`Task ${task.title}`}
      tabIndex={0}
      className={`${finalWrapper} relative z-10 rounded-lg shadow-sm border-2 border-base-content p-2 xl:p-4 transition-all duration-200 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-200 cursor-pointer`}
    >
      {/* Header: status left, actions right - align center for title/project/actions */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          {/* Status button at top-left inside header */}
          <button
            type="button"
            aria-label="Toggle task status"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              cycleStatus();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                cycleStatus();
              }
            }}
            className={`${buttonBase} ${buttonState}`}
            title={isDone ? 'Clear status' : isStarted ? 'Mark done' : 'Mark in progress'}
          >
            {isDone ? (
              <Check className="h-5 w-5" strokeWidth={2} />
            ) : isStarted ? (
              <Play className="h-5 w-5" />
            ) : (
              <span className={`h-2 w-2 rounded-full ${dotClass ?? 'bg-neutral'}`} />
            )}
          </button>

          <div className="flex items-baseline">
            <div className={`text-base md:text-md lg:text-lg font-medium ${textClass ?? ''}`}>
              <span className={`${textClass ?? ''}`}>{task.title}</span>
            </div>
            {/* show project or right content inline after title when provided */}
            {right && <div className="ml-3 text-sm align-baseline">{right}</div>}
          </div>
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
              className="cursor-pointer text-emerald-600 hover:text-emerald-600/80 btn-icon"
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
              className="cursor-pointer text-red-600 hover:text-red-600/80 btn-icon"
              title="Delete"
            >
              <Trash className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 -mx-2 xl:-mx-4 border-t border-gray-200/40" />

      {/* Description / notes */}
      {task.notes ? (
        <div className={`text-sm mb-3 py-2 xl:py-4 ${textClass ?? ''}`}>{task.notes}</div>
      ) : (
        <div className={`text-sm text-gray-400 mb-3 py-2 xl:py-4 ${textClass ? '' : ''}`}>
          No description
        </div>
      )}

      {/* Divider */}
      <div className="my-3 -mx-2 xl:-mx-4 border-t border-gray-200/40" />

      {/* Footer: due left, duration right */}
      <div className="flex items-center justify-between text-sm">
        <div className={`text-left text-sm ${textClass ?? ''}`}>
          {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}
        </div>
        <div className={`text-right text-sm ${textClass ?? ''}`}>
          {(() => {
            const estimated: number | undefined = task.estimatedDuration ?? undefined;
            if (typeof estimated === 'number' && estimated > 0) {
              const h = Math.floor(estimated / 60);
              const m = estimated % 60;
              return `${h}h ${m}m`;
            }
            return '—';
          })()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Background slab removed to render a single flat card */}

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
