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
      setProjectId(task.projectId ?? 'none');
    } else {
      setTitle('');
      setNotes('');
    }
  }, [task]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!task) return;
    const patch: Partial<Task> = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      projectId: projectId === 'none' ? null : projectId,
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
