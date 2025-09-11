'use client';

import React, { useState, useEffect } from 'react';
// ...existing code...
// import { Input } from './ui/input';
import useTaskStore, { Task } from '../lib/taskStore';
import useProjectStore from '../lib/projectStore';
import ChevronDown from './icons/ChevronDown';

export default function TaskModal({
  open,
  onOpenChange,
  initial,
  allowCreateProject,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Task> & { id?: string };
  allowCreateProject?: boolean;
}) {
  const createTask = useTaskStore((s) => s.createTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null);
  const [recurrence, setRecurrence] = useState<string | null>(initial?.recurrence ?? 'once');
  const [projectId, setProjectId] = useState<string | null>(initial?.projectId ?? null);
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    setDueDate(initial?.dueDate ?? null);
    setRecurrence(initial?.recurrence ?? 'once');
    setProjectId(initial?.projectId ?? null);
  }, [initial, open]);

  // local state for creating a project from this modal
  const [newProjectName, setNewProjectName] = useState('');
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

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

  function handleCreateProject() {
    const name = (newProjectName || '').trim();
    if (!name) return;
    // background duplicate check (case-insensitive)
    const exists = projects.some((p) => p.name.trim().toLowerCase() === name.toLowerCase());
    if (exists) {
      setToast({ type: 'error', message: 'A project with that name already exists.' });
      return;
    }
    const p = createProject(name);
    setProjectId(p.id);
    setNewProjectName('');
    setToast({ type: 'success', message: 'Project created and selected.' });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`px-4 py-2 rounded shadow-lg text-sm ${
              toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-2xl bg-base-100 rounded-lg p-6 shadow-lg border-1"
      >
        <h3 className="text-lg font-medium mb-6">{initial?.id ? 'Edit Task' : 'Add New Task'}</h3>
        {allowCreateProject && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">New project</div>
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateProject();
                }
              }}
              placeholder="New project name"
              className="input w-full mb-2"
            />
          </div>
        )}
        <label className="block">
          <div className="text-sm text-gray-600 mb-1">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input w-full rounded-lg border-slate-800"
          />
        </label>

        <label className="block mt-5">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 rounded-lg border bg-base-100"
            rows={4}
          />
        </label>

        {/* status & priority removed — default unstarted; priorities inferred by due date */}

        <label className="block mt-5">
          <div className="text-sm text-gray-600 mb-1">Due date</div>
          <input
            type="date"
            value={dueDate ? dueDate.split('T')[0] : ''}
            onChange={(e) =>
              setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)
            }
            className="p-2 rounded-lg border bg-base-100"
          />
        </label>

        {/* starts/completed/estimate/time spent removed per simplified schema */}

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:gap-4">
          <label className="w-full md:w-1/2">
            <div className="text-sm text-gray-600 mb-1">Recurrence</div>
            <div className="relative w-full">
              <select
                value={recurrence ?? 'once'}
                onChange={(e) => setRecurrence(e.target.value || 'once')}
                className="p-2 pr-12 appearance-none rounded-lg border bg-base-100 w-full"
              >
                <option value="once">Only once</option>
                <option value="daily">Daily</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            </div>
          </label>

          <label className="w-full md:w-1/2">
            <div className="text-sm text-gray-600 mb-1">Project</div>
            <div className="relative w-full">
              <select
                value={projectId ?? ''}
                onChange={(e) => setProjectId(e.target.value || null)}
                className="p-2 pr-12 appearance-none rounded-lg border bg-white w-full"
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

        {/* project creation moved above title; Create button removed per request */}

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            {initial?.id ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
