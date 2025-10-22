'use client';

import React from 'react';
import useProjectStore, { Project } from '../../lib/projectStore';
import useTaskStore from '../../lib/taskStore';
import { sanitizeTitle, sanitizeDescription } from '../../lib/text-format';
import { normalizeWhitespaceForTyping } from '../../lib/text-sanitizer';

import type { Task } from '../../lib/taskStore';

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
  const [durationHours, setDurationHours] = React.useState<string>('');
  const [durationMinutes, setDurationMinutes] = React.useState<string>('');

  React.useEffect(() => {
    if (!open) {
      setTitle('');
      setNotes('');
      setProjectId('none');
      setDurationHours('');
      setDurationMinutes('');
    }
  }, [open]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = {
      title: sanitizeTitle(title || 'Untitled Daily'),
      notes: sanitizeDescription(notes || '') || undefined,
      // parse duration fields into minutes if provided
      estimatedDuration: (() => {
        const hh = durationHours === '' ? 0 : Number(durationHours);
        const mm = durationMinutes === '' ? 0 : Number(durationMinutes);
        if (!Number.isFinite(hh) || !Number.isFinite(mm)) return undefined;
        if (hh < 0 || mm < 0 || mm >= 60) return undefined;
        const total = hh * 60 + mm;
        return total > 0 ? total : undefined;
      })(),
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
  const boxRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    const onDocMouse = (e: MouseEvent) => {
      if (!open) return;
      const el = boxRef.current;
      const target = e.target as Node | null;
      if (el && target && !el.contains(target)) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDocMouse);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDocMouse);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="modal modal-open" aria-hidden={!open} role="dialog" aria-modal="true">
      <div
        ref={boxRef}
        className="modal-box w-11/12 max-w-md"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-lg">Create Daily Task</h3>
        <form onSubmit={submit} className="mt-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            className="input input-bordered rounded-md w-full focus:outline-none focus-visible:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none focus:shadow-none focus-visible:shadow-none outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
            value={title}
            onChange={(e) => {
              const v = e.target.value;
              const firstAlphaIndex = v.search(/[A-Za-zÀ-ÖØ-öø-ÿ]/);
              if (firstAlphaIndex === -1) return setTitle(v);
              const char = v.charAt(firstAlphaIndex).toUpperCase();
              setTitle(v.slice(0, firstAlphaIndex) + char + v.slice(firstAlphaIndex + 1));
            }}
            onBlur={() => setTitle(sanitizeTitle(title || ''))}
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
            onChange={(e) => setNotes(normalizeWhitespaceForTyping(e.target.value))}
            onBlur={() => setNotes(sanitizeDescription(notes || ''))}
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

          <div className="flex flex-row align-middle py-4 gap-2 items-center">
            <label className="label">
              <span className="label-text align-middle">Estimated duration (hours / minutes)</span>
            </label>
            <div className="flex flex-row gap-2 w-full items-center">
              <input
                type="number"
                min={0}
                step={1}
                className="input input-bordered rounded-md w-full items-center text-right"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                aria-label="Estimated duration hours"
                placeholder="0"
              />
              <input
                type="number"
                min={0}
                max={59}
                step={1}
                className="input input-bordered rounded-md w-full items-center text-right"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                aria-label="Estimated duration minutes"
                placeholder="0"
              />
            </div>
          </div>

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
