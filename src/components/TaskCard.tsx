'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash, Check, Play, Circle, ChevronDown } from 'lucide-react';
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
  // Minimal safe normalizer: present code expects Task-like shape in many places.
  // To avoid large refactors here, just cast the incoming object to Task.
  // If needed later, we can reintroduce the richer normalization logic.
  return input as Task;
}

// Map task state to DaisyUI-inspired styling tokens
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
      badge: 'badge border border-success/40 bg-success/10 font-semibold text-success',
      supportingText: 'text-success',
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
        'badge border border-secondary/40 bg-secondary/10 text-secondary dark:text-secondary font-semibold',
      supportingText: 'text-secondary dark:text-secondary',
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

  // Control expansion state - mini view starts collapsed, full view starts expanded
  const [localExpanded, setLocalExpanded] = React.useState(view === 'full');
  const isCollapsedMini = view === 'mini' && !localExpanded;

  // Keep localExpanded in sync with the global `view` prop
  React.useEffect(() => {
    setLocalExpanded(view === 'full');
  }, [view]);

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
    projectName = asRecord.projectName as string;
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

  // Prefer dueTime when available, format both due and start times without seconds.
  const dueLabel = t.dueTime
    ? formatDateTimeShort(t.dueTime) ?? 'No due date'
    : t.dueDate
    ? formatDateTimeShort(t.dueDate) ?? 'No due date'
    : 'No due date';
  const startsLabel = t.startsAt ? formatDateTimeShort(t.startsAt) : null;

  // Format a date/time string to a locale-aware "date HH:MM" without seconds.
  function formatDateTimeShort(value?: string | null) {
    if (!value) return null;
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      const datePart = d.toLocaleDateString();
      const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${datePart} ${timePart}`;
    } catch {
      return null;
    }
  }

  // (kept format helper above) we don't need separate short vars here
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

  // Measure expanded content height so we can animate `max-height` smoothly.
  // We need dueLabel/estimatedLabel in scope so measure here.
  const expandedRef = React.useRef<HTMLDivElement | null>(null);
  const [expandedHeight, setExpandedHeight] = React.useState<number>(0);
  React.useLayoutEffect(() => {
    const el = expandedRef.current;
    if (!el) return;
    // read scrollHeight to use as target for max-height animation
    const h = el.scrollHeight;
    setExpandedHeight(h);
  }, [t.notes, dueLabel, estimatedLabel, view, localExpanded]);

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

  const cardBg = statusStyles.cardBackground ?? 'bg-base-100';
  const cardBaseClasses = `group/card relative z-10 overflow-hidden rounded-2xl border border-base-300/90 ${cardBg} backdrop-blur-sm transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-[0_1px_0_0_rgba(255,255,255,0.4)] ${statusStyles.cardBorder} ${statusStyles.cardShadow} ${statusStyles.focusRing} focus-visible:ring-offset-base-100`;

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

  const cardCollapsed = (
    <div role="article" aria-label={`Task ${t.title}`} tabIndex={0} className={cardBaseClasses}>
      <span
        className={`absolute inset-x-0 top-0 h-1 ${statusStyles.accentBar}`}
        aria-hidden="true"
      />

      <div className={`card-body ${isCollapsedMini ? '' : ''}`}>
        <div
          className={`flex items-center ${isCollapsedMini ? 'items-center' : 'flex-wrap'} gap-4`}
        >
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

          <div className={`flex-1 min-w-0 ${isCollapsedMini ? 'flex items-center' : 'space-y-2'}`}>
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <h3 className="text-base leading-none font-semibold text-base-content m-0">
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
                    <Edit className="text-success *:h-6 w-6" />
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

                {view === 'mini' || view === 'full' ? (
                  <button
                    aria-label={
                      view === 'mini'
                        ? 'Expand task'
                        : localExpanded
                        ? 'Collapse task'
                        : 'Expand task'
                    }
                    title={view === 'mini' ? 'Expand' : localExpanded ? 'Collapse' : 'Expand'}
                    aria-expanded={localExpanded}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setLocalExpanded(!localExpanded);
                    }}
                    className="btn btn-ghost btn-circle text-base-content/60 hover:text-base-content"
                  >
                    <ChevronDown
                      className={`h-6 w-6 transition-transform duration-200 ${
                        localExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Show expanded content for full view or when mini view is expanded */}
        {/* Expanded content: always present in DOM so we can animate height/opacity */}
        <div
          aria-hidden={!localExpanded}
          ref={expandedRef}
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
            localExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ maxHeight: localExpanded ? `${expandedHeight}px` : '0px' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={`py-2 text-md leading-relaxed ${statusStyles.supportingText} whitespace-pre-wrap break-words flex-1`}
            >
              {t.notes ? t.notes : <span className="italic opacity-60">No description</span>}
            </div>

            {/* Estimated duration pill aligned to the far-right of the description */}
            <div className="flex-shrink-0 self-start mt-2">
              <span
                className="text-base-content font-medium whitespace-nowrap"
                title={estimatedLabel}
              >
                Est · {estimatedLabel}
              </span>
            </div>
          </div>

          <div
            className={`w-full grid grid-cols-3 items-center gap-2 font-medium text-sm ${
              localExpanded ? 'mt-2' : 'mt-0'
            }`}
          >
            <div className="col-span-1">
              <span
                className={`${statusStyles.badge} w-full text-left inline-block truncate`}
                title={startsLabel ?? 'No start time'}
              >
                {startsLabel ? `Start · ${startsLabel}` : '—'}
              </span>
            </div>

            <div className="col-span-1 text-center">—</div>

            <div className="col-span-1 text-right">
              <span
                className={`${statusStyles.badge} w-full inline-block truncate`}
                title={dueLabel}
              >
                Due · {dueLabel}
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
          {cardCollapsed}
        </Link>
      ) : (
        cardCollapsed
      )}
    </div>
  );
}
