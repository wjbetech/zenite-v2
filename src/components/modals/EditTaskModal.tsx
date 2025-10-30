'use client';

import React from 'react';
import TaskModal from './TaskModal';
import type { Task } from '../../lib/taskStore';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
  // callback used by some consumers (server-backed lists) to persist the edit
  onSave?: (id: string, patch: Partial<Task>) => void;
};

export default function EditTaskModal({ open, onOpenChange, task, onSave }: Props) {
  return (
    <TaskModal
      open={open}
      onOpenChange={onOpenChange}
      initial={task ?? undefined}
      onSave={(id, patch) => onSave?.(id, patch)}
      submitLabel="Save"
    />
  );
}
