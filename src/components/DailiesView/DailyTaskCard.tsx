"use client";

import React from "react";
import TaskCard, { type Task as CanonicalTask } from "../TaskCard";

export type DailyTask = {
  id: string;
  title: string;
  notes?: string;
  completed?: boolean;
  started?: boolean;
  href?: string;
  projectName?: string;
  estimatedDuration?: number;
};

type Props = {
  task: DailyTask;
  onToggle?: (id: string) => void; // toggles between none -> started -> done -> none
  onEdit?: (task: DailyTask) => void;
  onDelete?: (id: string) => void;
};

// Thin adapter: map the lightweight DailyTask shape to the canonical Task and forward to TaskCard.
export default function DailyTaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const mapped: CanonicalTask = {
    id: task.id,
    title: task.title,
    notes: task.notes,
    createdAt: new Date().toISOString(),
    completed: !!task.completed,
    started: !!task.started,
    dueDate: null,
    recurrence: null,
    completedAt: null,
    estimatedDuration: task.estimatedDuration ?? undefined,
  };

  return (
    <TaskCard
      task={mapped}
      href={task.href}
      right={task.projectName}
      onEdit={() => onEdit?.(task)}
      onDelete={(id) => onDelete?.(id)}
      onStatusChange={(id, status) => {
        // keep existing simple onToggle behavior: translate statuses back to onToggle
        // callers expecting more complex flows can be updated later
        if (status === 'done' || status === 'tilde') {
          onToggle?.(id);
        } else {
          onToggle?.(id);
        }
      }}
    />
  );
}
