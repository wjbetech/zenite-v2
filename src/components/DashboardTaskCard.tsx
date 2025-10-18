'use client';

import React from 'react';
import DailyTaskCard, { DailyTask } from './DailyTaskCard';
import type { Task } from '../lib/taskStore';
import useProjectStore from '../lib/projectStore';

// Dashboard sometimes passes a slimmed task shape; include optional project fields
type DashboardTaskLike = Partial<Task> & { projectName?: string; projectId?: string | null };

type Props = {
  task: DashboardTaskLike;
  right?: React.ReactNode;
  href?: string;
  onEdit?: (task: DashboardTaskLike) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
  projectName?: string;
};

// Small adapter that maps the Task shape used by Dashboard -> DailyTaskCard
export default function DashboardTaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  projectName: incomingProjectName,
}: Props) {
  // derive linked project (subscribe to store so name updates are reflected)
  const linkedProject = useProjectStore((s) =>
    task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined,
  );
  const dt: DailyTask = {
    id: (task.id as string) || 'unknown',
    title: (task.title as string) || 'Untitled',
    notes: task.notes as string | undefined,
    completed: !!task.completed,
    started: !!task.started,
    href: undefined,
    // forward projectName prop from parent if provided; otherwise resolve via projectId
    projectName:
      incomingProjectName ?? task.projectName ?? (linkedProject ? linkedProject.name : undefined),
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
    </div>
  );
}
