'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash, Check, Play, Circle, ChevronDown, ChevronUp } from 'lucide-react';
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
  view?: 'full' | 'mini';
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

type StatusStyles = {
  accentBar: string;
  cardBorder: string;
  cardShadow: string;
  focusRing: string;
  cardBackground?: string;
  statusButton: string;
  statusIcon: string;
  badge: string;
  supportingText: string;
};

// Map task state to DaisyUI-inspired styling tokens
function getStatusStyles(isStarted: boolean, isDone: boolean, isStale: boolean): StatusStyles {
  if (isStale) {
    return {
      accentBar: 'bg-error',
      cardBorder: 'border-error/50',
      cardBackground: 'bg-error/5',
      cardShadow:
        'rounded-2xl shadow-lg shadow-base-content/20 hover:rounded-2xl hover:shadow-error/30 hover:-translate-y-1 hover:-translate-x-1',
      focusRing: 'focus-visible:ring-error/50',
      statusButton:
        'btn btn-circle btn-error text-error-content shadow-sm shadow-error/30 hover:shadow-error/40',
      statusIcon: 'text-error-content',
      badge: 'badge border border-error/40 bg-error/10 font-semibold text-error-content',
      supportingText: 'text-error-content/80',
    };
  }

  if (isDone) {
    return {
      accentBar: 'bg-success',
      cardBorder: 'border-success/40',
      cardBackground: 'bg-success/20',
      cardShadow:
        'rounded-2xl shadow-lg shadow-success/20 hover:rounded-2xl hover:shadow-success/30 hover:-translate-y-1 hover:-translate-x-1',
      focusRing: 'focus-visible:ring-success/50',
      statusButton:
        'btn btn-circle btn-success text-success shadow-sm shadow-success/40 hover:shadow-success/50',
      statusIcon: 'text-success-content',
      badge: 'badge border border-success/40 bg-success/10 font-semibold text-success-content',
      supportingText: 'text-success-content',
    };
  }

  if (isStarted) {
    return {
      accentBar: 'bg-secondary',
      cardBorder: 'border-secondary/40',
      cardBackground: 'bg-secondary/20',
      cardShadow:
        'rounded-2xl shadow-lg shadow-secondary/20 hover:rounded-2xl  hover:shadow-secondary/30 hover:-translate-y-1 hover:-translate-x-1',
      focusRing: 'focus-visible:ring-secondary/50',
      statusButton:
        'btn btn-circle btn-secondary text-secondary-content shadow-sm shadow-secondary/40 hover:shadow-secondary/50',
      statusIcon: 'text-secondary-content',
      badge:
        'badge border border-secondary/40 bg-secondary/10 text-secondary-content dark:text-secondary font-semibold',
      supportingText: 'text-secondary-content dark:text-secondary',
    };
  }

  return {
    accentBar: 'bg-base-300',
    cardBorder: 'border-base-200/80',
    cardBackground: 'bg-base-100',
    cardShadow:
      'rounded-2xl shadow-lg shadow-base-200/50 hover:rounded-2xl hover:shadow-lg hover:shadow-base-content/20 hover:-translate-y-1 hover:-translate-x-1',
    focusRing: 'focus-visible:ring-primary/40',
    statusButton:
      'btn btn-circle btn-ghost border-2 border-base-300 text-base-content hover:border-primary hover:bg-primary/10 hover:text-primary',
    statusIcon: 'text-base-content',
    badge: 'badge border border-base-300 bg-base-200 font-semibold text-base-content/70',
    supportingText: 'text-base-content',
  };
}

export default function TaskCard({
  task,
  right,
  href,
  onEdit,
  onDelete,
  onStatusChange,
  view = 'full',
}: Props) {
  const t = normalizeTaskLike(task as TaskLike);

  // Local expand state allows a single task to open its full view when the
  // global view toggle is set to 'mini'. We show the chevron when the card
  // can be expanded (global mini) or when it is currently expanded.
  const [localExpanded, setLocalExpanded] = React.useState(false);
  const effectiveFull = view === 'full' || localExpanded;
  // If the task becomes started (in-progress) from external updates, auto-expand
  React.useEffect(() => {
    if (t.started) setLocalExpanded(true);
  }, [t.started]);
  // Try to derive a connected project's display name from flexible shapes that
  // might include projectName or a nested project object. Fall back to
  // projectId when nothing else is available.
  const rawUnknown = task as unknown;
  const asRecord =
    typeof rawUnknown === 'object' && rawUnknown !== null
      ? (rawUnknown as Record<string, unknown>)
      : {};
  const projectIdOrNull = t.projectId as string | null | undefined;
  let projectName: string | undefined = undefined;
  if (typeof asRecord.projectName === 'string') {
    projectName = asRecord.projectName;
  } else if (
    asRecord.project &&
    typeof (asRecord.project as Record<string, unknown>).name === 'string'
  ) {
    projectName = (asRecord.project as Record<string, unknown>).name as string;
  } else if (typeof projectIdOrNull === 'string') {
    projectName = projectIdOrNull;
  }

  // Fallback: if caller passed the project name via the `right` prop (legacy
  // callers sometimes used `right` for this), prefer that as the display name
  // so Dashboard consumers who still supply `right` will render correctly.
  if (!projectName && typeof right === 'string' && right.trim().length > 0) {
    projectName = right;
  }

  // (previously rendered initials) we now render the full project name pill below
  const isDone = !!t.completed;
  const isStarted = !!t.started && !isDone;

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

  const statusStyles = getStatusStyles(isStarted, isDone, isStaleCompleted);

  const dueLabel = t.dueDate ? new Date(t.dueDate).toLocaleString() : 'No due date';
  const estimatedLabel = (() => {
    const estimated: number | undefined = t.estimatedDuration ?? undefined;
    if (typeof estimated === 'number' && estimated > 0) {
      const h = Math.floor(estimated / 60);
      const m = estimated % 60;
      if (h > 0) {
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
      return `${m}m`;
    }
    return '—';
  })();

  const shouldRenderRight =
    right &&
    (projectName == null ||
      (typeof right !== 'string' ? true : String(right).trim() !== projectName));

  const renderedRight = !shouldRenderRight ? null : typeof right === 'string' ? (
    <span className={`${statusStyles.badge} whitespace-nowrap`} title={right} aria-label={right}>
      {right}
    </span>
  ) : (
    <div className="flex-none">{right}</div>
  );

  const metaBadgeClass = `${statusStyles.badge} whitespace-nowrap`;
  const cardBg = statusStyles.cardBackground ?? 'bg-base-100/95';
  const cardBaseClasses = `group/card relative z-10 overflow-hidden rounded-2xl border border-base-300/90 ${cardBg} backdrop-blur-sm transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-[0_1px_0_0_rgba(255,255,255,0.4)] ${statusStyles.cardBorder} ${statusStyles.cardShadow} ${statusStyles.focusRing} focus-visible:ring-offset-base-100`;

  const cycleStatus = () => {
    if (!isStarted && !isDone) {
      onStatusChange?.(t.id, 'tilde');
      // optimistically expand the card when the user marks it in-progress
      setLocalExpanded(true);
      return;
    }
    if (isStarted && !isDone) {
      onStatusChange?.(t.id, 'done');
      return;
    }
    onStatusChange?.(t.id, 'none');
  };

  const cardInner = (
    <div role="article" aria-label={`Task ${t.title}`} tabIndex={0} className={cardBaseClasses}>
      <span
        className={`absolute inset-x-0 top-0 h-1 ${statusStyles.accentBar}`}
        aria-hidden="true"
      />

      <div className={`card-body ${view === 'mini' && !localExpanded ? 'pt-3 pb-2' : 'p-4'}`}>
        <div className="flex flex-wrap items-center gap-4">
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
            className={`${statusStyles.statusButton} transition-transform duration-200 group-hover/card:scale-105 focus-visible:outline-none focus-visible:ring-0`}
            title={isDone ? 'Clear status' : isStarted ? 'Mark done' : 'Mark in progress'}
          >
            {isDone ? (
              <Check className={`h-4 w-4 ${statusStyles.statusIcon}`} strokeWidth={2} />
            ) : isStarted ? (
              <Play className={`h-4 w-4 ${statusStyles.statusIcon}`} />
            ) : (
              <Circle className={`h-4 w-4 ${statusStyles.statusIcon}`} strokeWidth={2} />
            )}
          </button>

          <div className={`flex-1 min-w-0 ${view === 'mini' && !localExpanded ? '' : 'space-y-2'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <h3 className="card-title text-lg font-semibold leading-snug text-base-content align-middle">
                  {t.title}
                </h3>

                {projectName ? (
                  <span
                    className={`${statusStyles.badge} whitespace-nowrap ml-3`}
                    title={projectName}
                    aria-label={`Project ${projectName}`}
                  >
                    {projectName}
                  </span>
                ) : null}

                {renderedRight}
              </div>

              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    aria-label="Edit task"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onEdit?.(t as Task);
                    }}
                    className="btn btn-ghost btn-circle text-base-content/70 hover:text-primary"
                    title="Edit"
                  >
                    <Edit className="h-6 w-6" />
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
                    className="btn btn-ghost btn-circle text-error/80 hover:text-error"
                    title="Delete"
                  >
                    <Trash className="h-6 w-6" />
                  </button>
                )}

                {(view === 'mini' || localExpanded) && (
                  <button
                    aria-label={localExpanded ? 'Collapse task' : 'Expand task'}
                    title={localExpanded ? 'Collapse' : 'Expand'}
                    aria-expanded={localExpanded}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setLocalExpanded((v) => !v);
                    }}
                    className="btn btn-ghost btn-circle text-base-content/60 hover:text-base-content"
                  >
                    {localExpanded ? (
                      <ChevronUp className="h-6 w-6" />
                    ) : (
                      <ChevronDown className="h-6 w-6" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {t.notes && !effectiveFull && view !== 'mini' ? (
              <p
                className={`line-clamp-2 text-lg font-semibold leading-relaxed ${statusStyles.supportingText}`}
              >
                {t.notes}
              </p>
            ) : null}
          </div>
        </div>

        <div
          aria-hidden={!effectiveFull}
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
            effectiveFull ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-4">
            <div
              className={`text-lg font-semibold leading-relaxed ${statusStyles.supportingText} ${effectiveFull}`}
            >
              {t.notes ? t.notes : <span className="italic opacity-60">No description</span>}
            </div>

            <div className="flex flex-wrap items-center gap-2 font-medium text-xl">
              <span className={metaBadgeClass} title={dueLabel}>
                Due · {dueLabel}
              </span>
              <span className={metaBadgeClass} title={estimatedLabel}>
                Est · {estimatedLabel}
              </span>
            </div>
          </div>
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
