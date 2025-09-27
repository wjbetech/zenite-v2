'use client';

import React from 'react';
import useProjectStore, { Project } from '../lib/projectStore';
import useTaskStore from '../lib/taskStore';

import type { Task } from '../lib/taskStore';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (t: Task) => void;
};

export default function CreateDailyModal({ open, onOpenChange, onCreated }: Props) {
  const projects = useProjectStore((s) => s.projects) as Project[];
  const createTask = useTaskStore((s) => s.createTask);

  const [title, setTitle] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [projectId, setProjectId] = React.useState<string | 'none'>('none');

  React.useEffect(() => {
    if (!open) {
      setTitle('');
      setNotes('');
      setProjectId('none');
    }
  }, [open]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = {
      title: (title || 'Untitled Daily').trim(),
      notes: notes.trim() || undefined,
      recurrence: 'daily',
      projectId: projectId === 'none' ? null : projectId,
    };
    try {
      const created = await createTask(payload);
      onCreated?.(created);
      onOpenChange(false);
    } catch (err) {
      console.error('CreateDailyModal: failed to create daily task', err);
    }
  };

  if (!open) return null;

  return (
    <div className="modal modal-open" aria-hidden={!open} role="dialog" aria-modal="true">
      <div className="modal-box w-11/12 max-w-md">
        <h3 className="font-bold text-lg">Create daily task</h3>
        <form onSubmit={submit} className="mt-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            className="input input-bordered rounded-md w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Daily task title"
            placeholder="e.g. Workout"
            required
          />

          <label className="label mt-3">
            <span className="label-text">Notes (optional)</span>
          </label>
          <textarea
            className="textarea textarea-bordered rounded-md w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="Daily task notes"
            rows={3}
          />

          <label className="label mt-3">
            <span className="label-text">Connect to project (optional)</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value as string)}
            aria-label="Select project"
          >
            <option value="none">— None —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="modal-action mt-4">
            <button type="button" className="btn" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Create Daily
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
