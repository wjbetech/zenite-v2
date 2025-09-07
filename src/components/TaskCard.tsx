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

// Small helper to compute classes per status so intent is clear
function getStatusClasses(isStarted: boolean, isDone: boolean) {
  // default: base (not started)
  if (!isStarted && !isDone) {
    return {
      // subtle neutral card for unstarted tasks
      wrapper: 'bg-neutral-content text-neutral',
      border: 'border-neutral',
      // status box: transparent background with soft border
      button:
        'h-5 w-5 flex items-center justify-center rounded-md border-2 border-neutral text-neutral text-sm cursor-pointer transition-colors duration-200',
      icon: 'text-neutral',
    };
  }

  if (isStarted && !isDone) {
    return {
      // stronger primary tint to indicate in-progress
      wrapper: 'bg-primary text-primary-content',
      border: 'border-primary-content',
      // status box: filled primary color for clear affordance
      button:
        'h-5 w-5 flex items-center justify-center rounded-md border-2 border-primary-content bg-transparent text-info text-sm cursor-pointer transition-colors duration-200',
      icon: 'text-primary-content',
    };
  }

  // done
  return {
    // completed tasks get a darker muted background with inverted icon
    wrapper: 'bg-neutral/50 text-neutral-content/50',
    border: 'border-neutral-content/50',
    button:
      'h-5 w-5 flex items-center justify-center rounded-md border-2 border-neutral-content/50 bg-neutral/50 text-neutral-content/50 text-sm cursor-pointer transition-colors duration-200',
    icon: 'text-neutral-content',
  };
}

export default function TaskCard({ task, right, href, onEdit, onDelete, onStatusChange }: Props) {
  const isDone = !!task.completed;
  const isStarted = !!task.started && !isDone;

  const {
    wrapper: bgClass,
    border: borderClass,
    button: buttonClass,
    icon: iconClass,
  } = getStatusClasses(isStarted, isDone);

  const cycleStatus = () => {
    // debug/logging to verify handler is called in the browser
    console.log('TaskCard: cycleStatus', { id: task.id, isStarted, isDone });
    if (!isStarted && !isDone) {
      console.debug('TaskCard -> set started', task.id);
      onStatusChange?.(task.id, 'tilde');
      return;
    }
    if (isStarted && !isDone) {
      console.debug('TaskCard -> set done', task.id);
      onStatusChange?.(task.id, 'done');
      return;
    }
    console.debug('TaskCard -> clear status', task.id);
    onStatusChange?.(task.id, 'none');
  };

  const cardInner = (
    <div
      className={`${bgClass} relative z-10 rounded-md shadow-sm border ${borderClass} p-2 transition-all duration-200 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-200 cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div
                className={`text-base md:text-md lg:text-lg font-medium ${
                  isDone ? 'line-through' : ''
                }`}
              >
                {task.title}
              </div>

              <button
                type="button"
                aria-label="Toggle task status"
                // handle pointerdown to prevent Link navigation handlers and respond immediately on tap
                onPointerDown={(e) => {
                  // stop propagation so the Link wrapper doesn't receive the pointer event
                  e.stopPropagation();
                  // prevent default on pointerdown so Link/anchor doesn't navigate or steal the click
                  // we then call cycleStatus here so touch/mouse interactions are handled immediately
                  e.preventDefault();
                  cycleStatus();
                }}
                // keep click handler to swallow any remaining events
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onKeyDown={(e) => {
                  // support keyboard activation (Enter / Space)
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    cycleStatus();
                  }
                }}
                className={buttonClass}
                title={isDone ? 'Clear status' : isStarted ? 'Mark done' : 'Mark in progress'}
              >
                {isDone ? (
                  <Check className={`h-4 w-4 ${iconClass}`} strokeWidth={2} />
                ) : isStarted ? (
                  <span className={`text-sm font-bold ${iconClass}`}>∼</span>
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
                  className="cursor-pointer text-emerald-600 hover:text-emerald-600/80"
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
                  className="cursor-pointer text-red-600 hover:text-red-600/80"
                  title="Delete"
                >
                  <Trash className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start mt-1">
            {right && <div className="text-sm md:text-base text-white">{right}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Single slab (chunky 3D base / shadow) */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-md bg-base-200 border border-gray-200/20 z-0" />

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
