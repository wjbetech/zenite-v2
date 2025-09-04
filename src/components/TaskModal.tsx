'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import useTaskStore, { Task } from '../lib/taskStore';
import useProjectStore from '../lib/projectStore';
import ChevronDown from './icons/ChevronDown';

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
  const [recurrence, setRecurrence] = useState<string | null>(initial?.recurrence ?? 'once');
  const [projectId, setProjectId] = useState<string | null>(initial?.projectId ?? null);
  const projects = useProjectStore((s) => s.projects);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    setDueDate(initial?.dueDate ?? null);
    setRecurrence(initial?.recurrence ?? 'once');
    setProjectId(initial?.projectId ?? null);
  }, [initial, open]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) return;
    if (initial?.id) {
      updateTask(initial.id, {
        title: title.trim(),
        notes: notes.trim(),
        dueDate,
        projectId,
        recurrence: recurrence ?? undefined,
      });
    } else {
      createTask({
        title: title.trim(),
        notes: notes.trim(),
        dueDate,
        projectId,
        recurrence: recurrence ?? undefined,
      });
    }
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/90" onClick={() => onOpenChange(false)} />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border-1 border-gray-600"
      >
        <h3 className="text-lg font-medium mb-6">{initial?.id ? 'Edit Task' : 'Add New Task'}</h3>
        <label className="block">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Title</div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg"
          />
        </label>

        <label className="block mt-5">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900"
            rows={4}
          />
        </label>

        {/* status & priority removed — default unstarted; priorities inferred by due date */}

        <label className="block mt-5">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Due date</div>
          <input
            type="date"
            value={dueDate ? dueDate.split('T')[0] : ''}
            onChange={(e) =>
              setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)
            }
            className="p-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </label>

        {/* starts/completed/estimate/time spent removed per simplified schema */}

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:gap-4">
          <label className="w-full md:w-1/2">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Recurrence</div>
            <div className="relative w-full">
              <select
                value={recurrence ?? 'once'}
                onChange={(e) => setRecurrence(e.target.value || 'once')}
                className="p-2 pr-12 appearance-none rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 w-full"
              >
                <option value="once">Only once</option>
                <option value="daily">Daily</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            </div>
          </label>

          <label className="w-full md:w-1/2">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Project</div>
            <div className="relative w-full">
              <select
                value={projectId ?? ''}
                onChange={(e) => setProjectId(e.target.value || null)}
                className="p-2 pr-12 appearance-none rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 w-full"
              >
                <option value="">(none)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            </div>
          </label>
        </div>

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
