'use client';

import React from 'react';
import { Check, Play, Edit, Trash } from 'lucide-react';
import Link from 'next/link';

export type DailyTask = {
  id: string;
  title: string;
  notes?: string;
  completed?: boolean;
  started?: boolean;
  href?: string;
  projectName?: string;
};

type Props = {
  task: DailyTask;
  onToggle?: (id: string) => void; // toggles between none -> started -> done -> none
  onEdit?: (task: DailyTask) => void;
  onDelete?: (id: string) => void;
};

function statusClasses(task: DailyTask) {
  if (task.completed) {
    return {
      ring: 'ring-2 ring-success/40',
      bg: 'bg-success/10',
      text: 'text-success-content dark:text-success',
      dot: 'bg-success-content',
    };
  }
  if (task.started) {
    return {
      ring: 'ring-2 ring-accent/30',
      bg: 'bg-accent/10',
      text: 'text-accent-content dark:text-accent',
      dot: 'bg-accent-content',
    };
  }
  return {
    ring: 'ring-0',
    bg: 'bg-base-200',
    text: 'text-base-content',
    dot: 'bg-neutral',
  };
}

export default function DailyTaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const classes = statusClasses(task);

  const card = (
    <div
      role="article"
      aria-label={`Task ${task.title}`}
      tabIndex={0}
      className={`group flex items-center gap-4 p-3 rounded-lg shadow-sm transition-transform duration-150 ${classes.bg} ${classes.ring} hover:scale-[1.01] focus:scale-[1.01] focus:outline-none`}
      style={{ boxSizing: 'border-box' }}
    >
      <button
        aria-pressed={!!task.started || !!task.completed}
        aria-label={
          task.completed ? 'Mark as not done' : task.started ? 'Mark as done' : 'Start task'
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(task.id);
        }}
        className={`flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-colors cursor-pointer ${
          task.completed
            ? 'bg-success text-success-content'
            : task.started
            ? 'bg-accent text-accent-content'
            : 'bg-white border'
        }`}
      >
        {task.completed ? (
          <Check className="h-4 w-4" />
        ) : task.started ? (
          <Play className="h-4 w-4" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-neutral" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className={`flex items-center gap-2 min-w-0`}>
            {/* Title and project pill are inline so the pill sits immediately after the title text */}
            <div className={`font-medium ${classes.text} break-words min-w-0`}>
              <span className="align-middle">{task.title}</span>
              {task.projectName && (
                <span className="text-sm text-base-content bg-base-200 px-2 py-0.5 rounded-full truncate ml-2 align-middle">
                  {task.projectName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                aria-label="Edit task"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1 rounded-md text-info  cursor-pointer btn-icon"
              >
                <Edit className="h-4 w-4 text-info " />
              </button>
            )}
            {onDelete && (
              <button
                aria-label="Delete task"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 rounded-md text-error cursor-pointer btn-icon"
              >
                <Trash className="h-4 w-4 text-error" />
              </button>
            )}
          </div>
        </div>

        {task.notes && (
          <div className="text-sm text-muted-foreground break-words mt-1 pr-4">{task.notes}</div>
        )}
      </div>
    </div>
  );

  if (task.href) {
    return <Link href={task.href}>{card}</Link>;
  }

  return card;
}
