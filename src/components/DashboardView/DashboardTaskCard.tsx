'use client';

import React from 'react';
import TaskCard, { type Task as CardTask } from '../TaskCard';
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
  // Safely map optional fields from the potentially-slim dashboard task shape
  const maybeDue =
    typeof (task as Partial<DashboardTaskLike>).dueDate === 'string'
      ? (task as Partial<DashboardTaskLike>).dueDate
      : null;
  const maybeCreated: string =
    typeof (task as Partial<DashboardTaskLike>).createdAt === 'string'
      ? (task as Partial<DashboardTaskLike>).createdAt!
      : new Date().toISOString();
  const maybeEstimatedRaw = task as Partial<DashboardTaskLike> as unknown as {
    estimatedDuration?: unknown;
  };
  const maybeEstimated =
    typeof maybeEstimatedRaw.estimatedDuration === 'number'
      ? (maybeEstimatedRaw.estimatedDuration as number)
      : undefined;

  const mapped: CardTask = {
    id: String(task.id ?? 'unknown'),
    title: String(task.title ?? 'Untitled'),
    notes: task.notes as string | undefined,
    // forward estimatedDuration when present so the DailyTaskCard can render it
    completed: !!task.completed,
    started: !!task.started,
    createdAt: maybeCreated,
    dueDate: maybeDue,
    estimatedDuration: maybeEstimated ?? undefined,
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <TaskCard
          task={mapped}
          right={
            incomingProjectName ??
            task.projectName ??
            (linkedProject ? linkedProject.name : undefined)
          }
          onEdit={() => onEdit?.(task)}
          onDelete={(id) => onDelete?.(id)}
          onStatusChange={(id: string, status) => onStatusChange?.(id, status)}
        />
      </div>
    </div>
  );
}
