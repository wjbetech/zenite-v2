'use client';

import React from 'react';
import type { Task } from '../../lib/taskStore';
import useProjectStore from '../../lib/projectStore';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
  onSave: (id: string, patch: Partial<Task>) => void;
};

export default function EditTaskModal({ open, onOpenChange, task, onSave }: Props) {
  const [title, setTitle] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [dueDate, setDueDate] = React.useState<string>('');
  // duration inputs: separate hours and minutes to represent a duration
  const [durationHours, setDurationHours] = React.useState<string>('');
  const [durationMinutes, setDurationMinutes] = React.useState<string>('');
  const [projectId, setProjectId] = React.useState<string | 'none'>('none');
  const projects = useProjectStore((s) => s.projects);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (task) {
      setTitle(task.title ?? '');
      setNotes(task.notes ?? '');
      if (typeof task.estimatedDuration === 'number') {
        const h = Math.floor(task.estimatedDuration / 60);
        const m = task.estimatedDuration % 60;
        setDurationHours(String(h));
        setDurationMinutes(String(m));
      } else {
        setDurationHours('');
        setDurationMinutes('');
      }
      // Initialize due date (YYYY-MM-DD) if present
      if (task.dueDate) {
        setDueDate(task.dueDate.slice(0, 10));
      } else {
        setDueDate('');
      }
      setProjectId(task.projectId ?? 'none');
    } else {
      setTitle('');
      setNotes('');
    }
  }, [task]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!task) return;
    const parseDurationFromParts = (hStr: string, mStr: string) => {
      const hh = hStr === '' ? 0 : Number(hStr);
      const mm = mStr === '' ? 0 : Number(mStr);
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return undefined;
      if (hh < 0 || mm < 0 || mm >= 60) return undefined;
      const total = hh * 60 + mm;
      return total;
    };

    const total = parseDurationFromParts(durationHours, durationMinutes);

    const patch: Partial<Task> = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      projectId: projectId === 'none' ? null : projectId,
      // ensure we pass a number (minutes) only when parsed and > 0
      estimatedDuration: typeof total === 'number' && total > 0 ? total : undefined,
      dueDate: dueDate === '' ? null : dueDate,
    };
    onSave(task.id, patch);
    onOpenChange(false);
  };

  return (
    <div className={open ? 'modal modal-open' : 'modal'} aria-hidden={!open}>
      <div className="modal-box w-11/12 max-w-xl">
        <h3 className="font-bold text-lg">Edit Task</h3>
        <form onSubmit={submit} className="mt-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            className="input input-bordered rounded-md w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Task title"
            required
          />

          <label className="label mt-3">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            className="textarea textarea-bordered rounded-md w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="Task notes"
            rows={4}
          />

          <label className="label mt-3">
            <span className="label-text">Project (optional)</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value as string)}
            aria-label="Select project"
          >
            <option value="none">— None —</option>
            {/* Only render project options after client mount to avoid SSR/client hydration mismatches */}
            {mounted &&
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
          <label className="label mt-3">
            <span className="label-text">Due date (optional)</span>
          </label>
          <input
            type="date"
            className="input input-bordered rounded-md w-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
          />

          <div className="flex flex-row align-middle py-4 gap-2 items-center">
            <label className="label">
              <span className="label-text align-middle">Estimated duration (hours / minutes)</span>
            </label>
            <div className="flex flex-row gap-2 w-full items-center">
              <input
                type="number"
                min={0}
                step={1}
                className="input input-bordered rounded-md w-full items-center"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                aria-label="Estimated duration hours"
                placeholder="Hours"
              />
              <input
                type="number"
                min={0}
                max={59}
                step={1}
                className="input input-bordered rounded-md w-full items-center"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                aria-label="Estimated duration minutes"
                placeholder="Minutes"
              />
            </div>
          </div>

          <div className="modal-action mt-4">
            <button
              type="button"
              className="btn btn-error border-error-content text-error-content"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary border-primary-content text-primary-content"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
