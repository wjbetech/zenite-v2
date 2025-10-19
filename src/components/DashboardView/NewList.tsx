'use client';

import React from 'react';
import TaskSection from '../TaskSection';
import type { Task } from '../../lib/taskStore';

type Props = {
  tasks: Task[];
  heatmapOpen: boolean;
  onEdit: (t: Partial<Task>) => void;
  onDeleteById: (id: string) => void;
  onStatusChange: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

export default function NewList({
  tasks,
  heatmapOpen,
  onEdit,
  onDeleteById,
  onStatusChange,
}: Props) {
  return (
    <TaskSection
      expanded={!heatmapOpen}
      accentClass="border-emerald-400"
      tasks={tasks}
      noInnerScroll
      onEdit={(t) => onEdit(t)}
      onDelete={(id) => onDeleteById(id)}
      onStatusChange={onStatusChange}
    />
  );
}
