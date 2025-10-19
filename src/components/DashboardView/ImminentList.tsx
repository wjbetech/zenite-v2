'use client';

import React from 'react';
import TaskSection from '../TaskSection';
import type { Task } from '../../lib/taskStore';
import { daysUntil } from '../../lib/date-utils';

type Props = {
  tasks: Task[];
  heatmapOpen: boolean;
  onEdit: (t: Partial<Task>) => void;
  onDeleteById: (id: string) => void;
  onStatusChange: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

export default function ImminentList({
  tasks,
  heatmapOpen,
  onEdit,
  onDeleteById,
  onStatusChange,
}: Props) {
  return (
    <TaskSection
      expanded={!heatmapOpen}
      accentClass="border-rose-400"
      tasks={tasks}
      noInnerScroll
      renderRight={(t: Task) => {
        const days = daysUntil(t.dueDate);
        const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
        return <span className="text-xs text-gray-100">{dueLabel}</span>;
      }}
      onEdit={(t) => onEdit(t)}
      onDelete={(id) => onDeleteById(id)}
      onStatusChange={onStatusChange}
    />
  );
}
