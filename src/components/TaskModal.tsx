'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import useTaskStore, { Task } from '../lib/taskStore';

export default function TaskModal({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Task> & { id?: string };
}) {
  const createTask = useTaskStore((s) => s.createTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    setDueDate(initial?.dueDate ?? null);
  }, [initial, open]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) return;
    if (initial?.id) {
      updateTask(initial.id, { title: title.trim(), notes: notes.trim(), dueDate });
    } else {
      createTask({ title: title.trim(), notes: notes.trim(), dueDate });
    }
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg"
      >
        <h3 className="text-lg font-medium mb-2">{initial?.id ? 'Edit Task' : 'New Task'}</h3>
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border dark:border-slate-700 bg-white dark:bg-slate-900"
            required
          />
        </label>

        <label className="block mt-3">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 rounded border dark:border-slate-700 bg-white dark:bg-slate-900"
            rows={4}
          />
        </label>

        <label className="block mt-3">
          <div className="text-sm text-gray-600 mb-1">Due date</div>
          <input
            type="date"
            value={dueDate ? dueDate.split('T')[0] : ''}
            onChange={(e) =>
              setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)
            }
            className="p-2 rounded border dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="default" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initial?.id ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
}
