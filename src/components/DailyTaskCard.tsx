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
      text: 'text-success',
      dot: 'bg-success',
    };
  }
  if (task.started) {
    return {
      ring: 'ring-2 ring-accent/30',
      bg: 'bg-accent/10',
      text: 'text-accent',
      dot: 'bg-accent',
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
        className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 transition-colors cursor-pointer ${
          task.completed
            ? 'bg-success text-white'
            : task.started
            ? 'bg-accent text-white'
            : 'bg-white border'
        }`}
      >
        {task.completed ? (
          <Check className="h-5 w-5" />
        ) : task.started ? (
          <Play className="h-5 w-5" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-neutral" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className={`truncate font-medium ${classes.text}`}>
            {task.projectName ? `${task.title} - (${task.projectName})` : task.title}
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
          <div className="text-sm text-muted-foreground truncate mt-1">{task.notes}</div>
        )}
      </div>
    </div>
  );

  if (task.href) {
    return <Link href={task.href}>{card}</Link>;
  }

  return card;
}
