'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash, Check, Play } from 'lucide-react';
import type { Task } from '../lib/taskStore';
export type { Task } from '../lib/taskStore';

export type TaskLike = Partial<Task> & { id: string };

type Props = {
  task: TaskLike | Task;
  right?: React.ReactNode;
  href?: string;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

// Normalize flexible shapes (Dashboard/Dailies may pass slimmer objects) into a full Task
export function normalizeTaskLike(input: TaskLike | Task): Task {
  const raw = input as Partial<Record<string, unknown>>;
  const estimatedRaw = raw.estimatedDuration;
  return {
    id: input.id,
    title: (input.title as string) || 'Untitled',
    notes: (raw.notes as string | undefined) ?? undefined,
    estimatedDuration: typeof estimatedRaw === 'number' ? (estimatedRaw as number) : undefined,
    dueDate: (raw.dueDate as string | null | undefined) ?? null,
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    completed: raw.completed === true,
    started: raw.started === true,
    recurrence: (raw.recurrence as string | null | undefined) ?? null,
    completedAt: (raw.completedAt as string | null | undefined) ?? null,
  };
}

// Small helper to compute classes per status
function getStatusClasses(isStarted: boolean, isDone: boolean) {
  if (!isStarted && !isDone) {
    return {
      wrapper: 'bg-base-200 text-base-content',
      buttonBase:
        'flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors cursor-pointer',
      buttonState: 'bg-white border',
      dot: 'bg-neutral',
      text: 'text-base-content',
    };
  }

  if (isStarted && !isDone) {
    return {
      wrapper: 'bg-accent/10 border-accent',
      buttonBase:
        'flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors cursor-pointer',
      buttonState: 'bg-accent text-accent-content',
      dot: 'bg-accent-content',
      text: '',
    };
  }

  return {
    wrapper: 'bg-success/10 border-success',
    buttonBase:
      'flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors cursor-pointer',
    buttonState: 'bg-success text-success-content',
    dot: 'bg-success-content',
    text: '',
  };
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function TaskCard({ task, right, href, onEdit, onDelete, onStatusChange }: Props) {
  const t = normalizeTaskLike(task as TaskLike);
  const isDone = !!t.completed;
  const isStarted = !!t.started && !isDone;

  const {
    wrapper: bgClass,
    buttonBase,
    buttonState,
    dot: dotClass,
    text: textClass,
  } = getStatusClasses(isStarted, isDone);

  // Detect stale completed one-off tasks
  let isStaleCompleted = false;
  try {
    if (t.completed && !(t.recurrence === 'daily' || t.recurrence === 'weekly')) {
      if (t.completedAt) {
        const comp = new Date(t.completedAt);
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
      onStatusChange?.(t.id, 'tilde');
      return;
    }
    if (isStarted && !isDone) {
      onStatusChange?.(t.id, 'done');
      return;
    }
    onStatusChange?.(t.id, 'none');
  };

  const cardInner = (
    <div
      role="article"
      aria-label={`Task ${t.title}`}
      tabIndex={0}
      className={`${finalWrapper} relative z-10 rounded-lg shadow-sm border-2  p-2 xl:p-4 transition-all duration-200 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-200 cursor-pointer`}
    >
      {/* Header: status left, title + duration + project, actions right (baseline aligned) */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
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
              <span className={`${textClass ?? ''}`}>{t.title}</span>
            </div>

            {typeof t.estimatedDuration === 'number' && t.estimatedDuration > 0 && (
              <span className="text-sm text-base-content bg-base-200 px-2 py-0.5 rounded-full truncate ml-2">
                Duration:
                {formatDuration(t.estimatedDuration)}
              </span>
            )}

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
                onEdit?.(t as Task);
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
                onDelete?.(t.id);
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
      {t.notes ? (
        <div className={`text-sm mb-3 py-2 xl:py-4 ${textClass ?? ''}`}>{t.notes}</div>
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
          {t.dueDate ? new Date(t.dueDate).toLocaleString() : 'No due date'}
        </div>
        <div className={`text-right text-sm ${textClass ?? ''}`}>
          {(() => {
            const estimated: number | undefined = t.estimatedDuration ?? undefined;
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
