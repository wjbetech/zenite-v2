'use client';

import React from 'react';
import TaskCard, { type Task as CanonicalTask } from '../TaskCard';
import type { Task } from '../../lib/taskStore';
import useProjectStore from '../../lib/projectStore';

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

export default function DashboardTaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  projectName: incomingProjectName,
}: Props) {
  const linkedProject = useProjectStore((s) =>
    task.projectId ? s.projects.find((p) => p.id === task.projectId) : undefined,
  );

  const raw = task as Partial<Record<string, unknown>>;
  const mapped: CanonicalTask = {
    id: String(task.id ?? 'unknown'),
    title: String(task.title ?? 'Untitled'),
    notes: task.notes as string | undefined,
    createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString(),
    completed: !!task.completed,
    started: !!task.started,
    dueDate: typeof task.dueDate === 'string' ? (task.dueDate as string) : null,
    recurrence: typeof task.recurrence === 'string' ? (task.recurrence as string) : null,
    completedAt: null,
    estimatedDuration: typeof raw.estimatedDuration === 'number' ? (raw.estimatedDuration as number) : undefined,
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <TaskCard
          task={mapped}
          right={incomingProjectName ?? task.projectName ?? (linkedProject ? linkedProject.name : undefined)}
          onEdit={() => onEdit?.(task)}
          onDelete={(id) => onDelete?.(id)}
          onStatusChange={(id: string, status) => onStatusChange?.(id, status)}
        />
      </div>
    </div>
  );
}
