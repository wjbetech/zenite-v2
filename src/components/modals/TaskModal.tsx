'use client';

import React, { useState, useEffect } from 'react';
import useTaskStore, { Task } from '../../lib/taskStore';
import useProjectStore, { RemoteProject, normalizeRemoteProject } from '../../lib/projectStore';
import api from '../../lib/api';
import {
  sanitizeTitle,
  sanitizeDescription,
  sanitizeDescriptionPreserveNewlines,
} from '../../lib/text-format';
import { normalizeWhitespaceForTyping } from '../../lib/text-sanitizer';
import { composeDueTimeIso, alignStartsAtToDueDate } from '../../lib/taskDateUtils';
import { toast } from 'react-toastify';
import ChevronDown from '../icons/ChevronDown';
import TaskModalLocalToast from './TaskModalLocalToast';
import ProjectCreationFields from './ProjectCreationFields';
import ModalActions from './ModalActions';

export default function TaskModal({
  open,
  onOpenChange,
  initial,
  allowCreateProject,
  onSave: onSaveExternal,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Task> & { id?: string };
  allowCreateProject?: boolean;
  // optional callback for callers who want to be notified when a task is saved
  onSave?: (id: string, patch: Partial<Task>) => void;
  submitLabel?: string;
}) {
  const createTask = useTaskStore((s) => s.createTask);
  const updateTask = useTaskStore((s) => s.updateTask);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null);
  const [startsAt, setStartsAt] = useState<string | null>(initial?.startsAt ?? null);
  const [dueTime, setDueTime] = useState<string | null>(initial?.dueTime ?? null);
  const [recurrence, setRecurrence] = useState<string | null>(initial?.recurrence ?? 'once');
  const [projectId, setProjectId] = useState<string | null>(initial?.projectId ?? null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>(
    initial?.estimatedDuration ?? undefined,
  );
  const [durationHours, setDurationHours] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const projects = useProjectStore((s) => s.projects);
  const [newProjectCreated, setNewProjectCreated] = useState(false);
  const [showTaskInputs, setShowTaskInputs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // local state for creating a project from this modal
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectLoading, setNewProjectLoading] = useState(false);
  const [localToast, setLocalToast] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  useEffect(() => {
    setTitle(initial?.title ?? '');
    setNotes(initial?.notes ?? '');
    setDueDate(initial?.dueDate ?? null);
    setStartsAt(initial?.startsAt ?? null);
    setDueTime(initial?.dueTime ?? null);
    setRecurrence(initial?.recurrence ?? 'once');
    setProjectId(initial?.projectId ?? null);
    setEstimatedDuration(initial?.estimatedDuration ?? undefined);
    // initialize hours/minutes inputs from estimatedDuration (minutes)
    if (initial?.estimatedDuration && Number.isFinite(initial.estimatedDuration)) {
      const hh = Math.floor(initial.estimatedDuration / 60).toString();
      const mm = (initial.estimatedDuration % 60).toString();
      setDurationHours(hh);
      setDurationMinutes(mm);
    } else {
      setDurationHours('');
      setDurationMinutes('');
    }
    // reset the 'new project created' subheader when modal opens or initial changes
    setNewProjectCreated(false);
    // default: when opened as New Project (and not editing) hide task inputs
    setShowTaskInputs(!(allowCreateProject && !initial?.id));
    setSubmitError(null);
    setSaving(false);
  }, [initial, open, allowCreateProject]);

  // When a dueDate is provided, ensure the startsAt date portion matches that day.
  // If startsAt is unset, default it to midnight of the due date. If startsAt has a
  // time component, preserve the time but update the date to match dueDate.
  useEffect(() => {
    if (!dueDate) return;
    try {
      const adjusted = alignStartsAtToDueDate(startsAt ?? null, dueDate ?? null);
      if (adjusted && adjusted !== startsAt) setStartsAt(adjusted);
    } catch {
      // ignore
    }
  }, [dueDate, startsAt]);
  useEffect(() => {
    if (!localToast) return;
    const id = setTimeout(() => setLocalToast(null), 3000);
    return () => clearTimeout(id);
  }, [localToast]);

  // Helpers for formatting ISO strings into input-friendly values
  function toLocalDateTimeValue(iso: string) {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      const hh = `${d.getHours()}`.padStart(2, '0');
      const mm = `${d.getMinutes()}`.padStart(2, '0');
      return `${y}-${m}-${day}T${hh}:${mm}`;
    } catch {
      return '';
    }
  }

  function toTimeValue(iso: string) {
    try {
      const d = new Date(iso);
      const hh = `${d.getHours()}`.padStart(2, '0');
      const mm = `${d.getMinutes()}`.padStart(2, '0');
      return `${hh}:${mm}`;
    } catch {
      return '';
    }
  }

  // Helpers to convert between minutes (number) and HH:MM time input value
  // durationHours/durationMinutes are kept in sync with estimatedDuration below

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (saving) return;

    // Determine whether we're expected to create/update a task. When the
    // modal is used for "Add New Project" and the user has not toggled
    // "Create task", we should allow creating only the project without a
    // task. Only require a title when a task will be created/updated.
    const willCreateOrUpdateTask = Boolean(initial?.id) || Boolean(showTaskInputs);
    if (willCreateOrUpdateTask && !title.trim()) return;

    setSubmitError(null);
    setSaving(true);

    const tryCreateProjectBeforeTask = async (): Promise<string | null> => {
      if (allowCreateProject && newProjectName.trim() && !projectId) {
        return await createAndSelectProject(newProjectName.trim(), newProjectDescription.trim());
      }
      return null;
    };

    let createdProjectName: string | null = null;

    try {
      if (initial?.id) {
        const id = initial.id;
        const patch = {
          title: sanitizeTitle(title || ''),
          notes: sanitizeDescription(notes || ''),
          dueDate,
          startsAt,
          dueTime,
          estimatedDuration: estimatedDuration ?? undefined,
          projectId,
          recurrence: recurrence ?? undefined,
        } as Partial<Task>;

        // If a caller provided an onSave handler, delegate persistence to it. This
        // keeps server-backed consumers (project lists) in control of how updates
        // are applied and matches the previous EditTaskModal behavior used in tests.
        if (onSaveExternal) {
          try {
            // call synchronously so tests that mock onSave see the call immediately
            (onSaveExternal as unknown as (id: string, patch: Partial<Task>) => void)(
              id,
              patch,
            );
          } catch (e) {
            console.warn('TaskModal onSave callback threw', e);
          }
        } else {
          // default internal behavior: update the task via the local store / API
          await updateTask(id, patch);
          try {
            if (typeof onSaveExternal === 'function')
              (onSaveExternal as unknown as (id: string, patch: Partial<Task>) => void)(
                id,
                patch,
              );
          } catch (e) {
            console.warn('TaskModal onSave callback threw', e);
          }
        }
      } else {
        createdProjectName = await tryCreateProjectBeforeTask();

        // Only create a task if the user requested it (or we're in edit mode).
        if (willCreateOrUpdateTask) {
          await createTask({
            title: sanitizeTitle(title || ''),
            notes: sanitizeDescription(notes || ''),
            dueDate,
            startsAt,
            dueTime,
            estimatedDuration: estimatedDuration ?? undefined,
            projectId,
            recurrence: recurrence ?? undefined,
          });
        }
      }

      onOpenChange(false);

      if (createdProjectName) {
        toast.dismiss();
        toast.success(`New project was created: ${createdProjectName}`, {
          autoClose: 4000,
          position: 'top-center',
        });
      }
    } catch (err) {
      console.error('TaskModal submit failed', err);
      const message = err instanceof Error ? err.message : 'Failed to save task';
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  }

  async function createAndSelectProject(
    name: string,
    description?: string,
  ): Promise<string | null> {
    // avoid duplicate checks if already exist
    const storeProjects = useProjectStore.getState().projects;
    const exists = storeProjects.some((p) => p.name.trim().toLowerCase() === name.toLowerCase());
    if (exists) {
      const existing = storeProjects.find(
        (p) => p.name.trim().toLowerCase() === name.toLowerCase(),
      );
      if (existing) setProjectId(existing.id);
      return existing?.name ?? null;
    }

    setNewProjectLoading(true);
    try {
      const store = useProjectStore.getState();
      // Try remote-first: prefer creating the project via the API so it persists.
      // Fall back to local store if the API is unavailable or returns no id.
      let createdRemote: RemoteProject | null = null;
      try {
        const created = (await api.createProject({ name, description })) as {
          id?: unknown;
          name?: unknown;
          description?: unknown;
          createdAt?: unknown;
          taskCount?: unknown;
          _count?: { tasks?: unknown } | null;
        };
        createdRemote = created as RemoteProject;
      } catch (e) {
        console.warn('createAndSelectProject: remote create failed, falling back to local', e);
        createdRemote = null;
      }

      // sanitize project name/description on create path
      const sanitizedName = sanitizeTitle(name);
      // Preserve paragraph/newline boundaries for project descriptions
      const sanitizedDescription = sanitizeDescriptionPreserveNewlines(description || '');

      if (createdRemote) {
        const normalized = normalizeRemoteProject(createdRemote as RemoteProject);
        if (normalized.id) {
          const updated = [
            normalized,
            ...store.projects.filter((project) => project.id !== normalized.id),
          ];
          store.setProjects(updated);
          setProjectId(normalized.id);
        } else {
          // remote returned no id - fall back to local
          const p = store.createProject(sanitizedName);
          store.setProjects([p, ...store.projects.filter((project) => project.id !== p.id)]);
          setProjectId(p.id);
        }
      } else {
        const p = store.createProject(sanitizedName);
        // set description on local fallback project
        p.description = sanitizedDescription || undefined;
        store.setProjects([p, ...store.projects.filter((project) => project.id !== p.id)]);
        setProjectId(p.id);
      }
      setNewProjectName('');
      setNewProjectDescription('');
      // mark that we created a new project from this modal so we can show the 'New Task' subheader
      setNewProjectCreated(true);
      // do NOT show a toast here; callers will display a single standardized toast
      return name;
    } catch (err) {
      console.error('createAndSelectProject failed', err);
      const message = err instanceof Error ? err.message : String(err);
      setLocalToast({ type: 'error', message: message || 'Failed to create project' });
      return null;
    } finally {
      setNewProjectLoading(false);
    }
  }

  function handleCreateProject() {
    (async () => {
      const name = (newProjectName || '').trim();
      if (!name) return;
      // background duplicate check (case-insensitive)
      const exists = useProjectStore
        .getState()
        .projects.some((p) => p.name.trim().toLowerCase() === name.toLowerCase());
      if (exists) {
        setLocalToast({ type: 'error', message: 'A project with that name already exists.' });
        return;
      }

      await createAndSelectProject(name, newProjectDescription.trim());
    })();
  }

  // form classes: remove border when creating a new task (no initial.id)
  const formClass = `relative z-10 w-full max-w-2xl bg-base-100 rounded-lg p-6 shadow-lg ${
    initial?.id ? 'border-1' : ''
  }`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <TaskModalLocalToast toast={localToast} />
      <div className="absolute inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <form onSubmit={submit} className={formClass}>
        <h3 className="text-lg font-medium mb-3">
          {initial?.id ? 'Edit Task' : allowCreateProject ? 'Add New Project' : 'Add New Task'}
        </h3>

        {allowCreateProject && (
          <ProjectCreationFields
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            newProjectDescription={newProjectDescription}
            setNewProjectDescription={setNewProjectDescription}
            newProjectLoading={newProjectLoading}
            onCreateProjectKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateProject();
              }
            }}
          />
        )}
        {(allowCreateProject || newProjectCreated) && !initial?.id && (
          <div className="flex items-center justify-between text-muted mb-3">
            <h4 className="text-lg font-semibold">New Task</h4>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-xs">Create task</span>
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={showTaskInputs}
                onChange={(e) => setShowTaskInputs(e.target.checked)}
              />
            </label>
          </div>
        )}

        {/* Task inputs are conditional: show when editing or when the toggle is on */}
        {(initial?.id || showTaskInputs) && (
          <>
            <label className="block mb-1">Title</label>
            <input
              aria-label={initial?.recurrence === 'daily' ? 'Daily task title' : 'Task title'}
              data-testid="task-title-input"
              value={title}
              onChange={(e) => {
                const v = e.target.value;
                // Lightweight: capitalize first alpha character as user types
                const firstAlphaIndex = v.search(/[A-Za-zÀ-ÖØ-öø-ÿ]/);
                if (firstAlphaIndex === -1) return setTitle(v);
                const char = v.charAt(firstAlphaIndex).toUpperCase();
                setTitle(v.slice(0, firstAlphaIndex) + char + v.slice(firstAlphaIndex + 1));
              }}
              onBlur={() => setTitle(sanitizeTitle(title || ''))}
              required
              className="input w-full rounded-lg focus:border-content"
            />

            <label className="block mt-5 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(normalizeWhitespaceForTyping(e.target.value));
              }}
              onBlur={() => setNotes(sanitizeDescription(notes || ''))}
              className="w-full p-2 rounded-lg textarea bg-base-100 focus:border-content"
              rows={4}
            />

            <label className="label mt-5">
              <span className="label-text text-base-content">
                Due Date
                <span className="text-xs text-base-content"> (optional)</span>
              </span>
            </label>
            <input
              type="date"
              className="input input-bordered rounded-md w-full"
              value={dueDate ? dueDate.split('T')[0] : ''}
              onChange={(e) =>
                setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)
              }
            />

            {/* Start and due time inputs placed under Due Date */}
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <div className="w-full md:w-1/2">
                <label className="label">
                  <span className="label-text text-base-content">
                    Start Time
                    <span className="text-xs text-base-content"> (optional)</span>
                  </span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered rounded-md w-full"
                  value={startsAt ? toLocalDateTimeValue(startsAt) : ''}
                  onChange={(e) =>
                    setStartsAt(e.target.value ? new Date(e.target.value).toISOString() : null)
                  }
                />
              </div>

              <div className="w-full md:w-1/2">
                <label className="label">
                  <span className="label-text text-base-content">
                    Due Time
                    <span className="text-xs text-base-content"> (optional)</span>
                  </span>
                </label>
                <input
                  type="time"
                  className="input input-bordered rounded-md w-full"
                  value={dueTime ? toTimeValue(dueTime) : ''}
                  onChange={(e) => {
                    const time = e.target.value; // HH:MM
                    const composed = composeDueTimeIso(dueDate ?? null, time ?? null);
                    setDueTime(composed);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row align-middle py-4 gap-2 items-center mt-5">
              <label className="label mr-4">
                <span className="label-text align-middle text-base-content">
                  Estimated duration (hrs. / mins.)
                </span>
              </label>
              {/* push inputs to the right and keep them inline */}
              <div className="flex flex-row gap-2 w-full items-center justify-end">
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="input input-bordered rounded-md w-20 max-w-[5rem] pr-4 text-right"
                  value={durationHours}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDurationHours(v);
                    const hh = v === '' ? 0 : Number(v);
                    const mm = durationMinutes === '' ? 0 : Number(durationMinutes);
                    if (
                      !Number.isFinite(hh) ||
                      !Number.isFinite(mm) ||
                      hh < 0 ||
                      mm < 0 ||
                      mm > 60
                    ) {
                      setEstimatedDuration(undefined);
                    } else {
                      const total = hh * 60 + mm;
                      setEstimatedDuration(total > 0 ? total : undefined);
                    }
                  }}
                  aria-label="Estimated duration hours"
                  placeholder="0"
                />
                <input
                  type="number"
                  min={0}
                  max={60}
                  step={1}
                  className="input input-bordered rounded-md w-20 max-w-[5rem] pr-4 text-right"
                  value={durationMinutes}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDurationMinutes(v);
                    const hh = durationHours === '' ? 0 : Number(durationHours);
                    const mm = v === '' ? 0 : Number(v);
                    if (
                      !Number.isFinite(hh) ||
                      !Number.isFinite(mm) ||
                      hh < 0 ||
                      mm < 0 ||
                      mm > 60
                    ) {
                      setEstimatedDuration(undefined);
                    } else {
                      const total = hh * 60 + mm;
                      setEstimatedDuration(total > 0 ? total : undefined);
                    }
                  }}
                  aria-label="Estimated duration minutes"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:gap-4">
              <div className="w-full md:w-1/2">
                <label className="block mb-2">Recurrence</label>
                <div className="relative w-full">
                  <select
                    value={recurrence ?? 'once'}
                    onChange={(e) => setRecurrence(e.target.value || 'once')}
                    className="select select-bordered p-2 pr-12 appearance-none rounded-lg bg-base-100 w-full"
                  >
                    <option value="once">Only once</option>
                    <option value="daily">Daily</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <label className="block mb-2">Project</label>
                <div className="relative w-full">
                  <select
                    value={projectId ?? ''}
                    onChange={(e) => setProjectId(e.target.value || null)}
                    className="select select-bordered p-2 pr-12 appearance-none rounded-lg bg-base-100 w-full"
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
              </div>
            </div>
          </>
        )}

        <ModalActions
          submitError={submitError}
          onCancel={() => onOpenChange(false)}
          saving={saving}
          submitLabel={submitLabel ?? (initial?.id ? 'Save' : 'Create')}
        />
      </form>
    </div>
  );
}
