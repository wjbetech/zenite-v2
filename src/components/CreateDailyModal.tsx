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

  // Close on Escape key when open
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Prevent layout shift when modal opens by compensating for scrollbar disappearance
  React.useEffect(() => {
    if (!open) return;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    // hide scroll and add padding to avoid content shift
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
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
    <div
      className="modal modal-open"
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      // close when clicking on the backdrop only
      onMouseDown={(e) => {
        // only close when the backdrop (currentTarget) was the actual event target
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      {/* stop propagation inside the modal so clicks don't bubble to the backdrop */}
      <div className="modal-box w-11/12 max-w-md" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg">Create Daily Task</h3>
        <form onSubmit={submit} className="mt-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            className="input input-bordered rounded-md w-full focus:outline-none focus-visible:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none focus:shadow-none focus-visible:shadow-none outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
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
            className="textarea textarea-bordered rounded-md w-full focus:outline-none focus-visible:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none focus:shadow-none focus-visible:shadow-none outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="Daily task notes"
            rows={3}
          />

          <label className="label mt-3">
            <span className="label-text">Connect to project (optional)</span>
          </label>
          <select
            className="select select-bordered w-full focus:outline-none focus-visible:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none focus:shadow-none focus-visible:shadow-none outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
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
            <button
              type="button"
              className="btn btn-warning border-2 border-warning-content text-warning-content"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success border-2 border-success-content text-success-content"
            >
              Create Daily
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
