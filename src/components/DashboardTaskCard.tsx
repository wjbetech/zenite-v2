'use client';

import React from 'react';
import DailyTaskCard, { DailyTask } from './DailyTaskCard';
import type { Task as OldTask } from './TaskCard';

type Props = {
  task: OldTask;
  right?: React.ReactNode;
  href?: string;
  onEdit?: (task: OldTask) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

// Small adapter that maps the Task shape used by Dashboard -> DailyTaskCard
export default function DashboardTaskCard({
  task,
  right,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const dt: DailyTask = {
    id: task.id,
    title: task.title,
    notes: task.notes,
    completed: !!task.completed,
    started: !!task.started,
    href: undefined,
    projectName: undefined,
  };

  const handleToggle = (id: string) => {
    // cycle same as TaskCard/Other handlers: none -> started -> done -> none
    if (!task.started && !task.completed) {
      onStatusChange?.(id, 'tilde');
      return;
    }
    if (task.started && !task.completed) {
      onStatusChange?.(id, 'done');
      return;
    }
    onStatusChange?.(id, 'none');
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <DailyTaskCard
          task={dt}
          onToggle={handleToggle}
          onEdit={() => onEdit?.(task)}
          onDelete={(id) => onDelete?.(id)}
        />
      </div>
      {right && <div className="ml-3 shrink-0">{right}</div>}
    </div>
  );
}
