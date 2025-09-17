'use client';

import React from 'react';
import type { Task } from '../lib/taskStore';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
  onSave: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
};

export default function EditTaskModal({ open, onOpenChange, task, onSave, onDelete }: Props) {
  const [title, setTitle] = React.useState('');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (task) {
      setTitle(task.title ?? '');
      setNotes(task.notes ?? '');
    } else {
      setTitle('');
      setNotes('');
    }
  }, [task]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!task) return;
    const patch: Partial<Task> = { title: title.trim(), notes: notes.trim() || undefined };
    onSave(task.id, patch);
    onOpenChange(false);
  };

  const remove = () => {
    if (!task) return;
    onDelete(task.id);
    onOpenChange(false);
  };

  return (
    <div className={open ? 'modal modal-open' : 'modal'} aria-hidden={!open}>
      <div className="modal-box w-11/12 max-w-xl">
        <h3 className="font-bold text-lg">Edit task</h3>
        <form onSubmit={submit} className="mt-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Task title"
            required
          />

          <label className="label mt-3">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="Task notes"
            rows={4}
          />

          <div className="modal-action mt-4">
            <button type="button" className="btn btn-ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-error" onClick={remove}>
              Delete
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
