'use client';

import React, { useState, useEffect } from 'react';
import useTaskStore, { Task } from '../../lib/taskStore';
import useProjectStore, { RemoteProject, normalizeRemoteProject } from '../../lib/projectStore';
import api from '../../lib/api';
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
    setRecurrence(initial?.recurrence ?? 'once');
    setProjectId(initial?.projectId ?? null);
    // reset the 'new project created' subheader when modal opens or initial changes
    setNewProjectCreated(false);
    // default: when opened as New Project (and not editing) hide task inputs
    setShowTaskInputs(!(allowCreateProject && !initial?.id));
    setSubmitError(null);
    setSaving(false);
  }, [initial, open, allowCreateProject]);
  useEffect(() => {
    if (!localToast) return;
    const id = setTimeout(() => setLocalToast(null), 3000);
    return () => clearTimeout(id);
  }, [localToast]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim() || saving) return;

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
        await tryCreateProjectBeforeTask();
        await updateTask(id, {
          title: title.trim(),
          notes: notes.trim(),
          dueDate,
          projectId,
          recurrence: recurrence ?? undefined,
        });
      } else {
        createdProjectName = await tryCreateProjectBeforeTask();

        await createTask({
          title: title.trim(),
          notes: notes.trim(),
          dueDate,
          projectId,
          recurrence: recurrence ?? undefined,
        });
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
          const p = store.createProject(name);
          store.setProjects([p, ...store.projects.filter((project) => project.id !== p.id)]);
          setProjectId(p.id);
        }
      } else {
        const p = store.createProject(name);
        // set description on local fallback project
        p.description = description || undefined;
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <TaskModalLocalToast toast={localToast} />
      <div className="absolute inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-2xl bg-base-100 rounded-lg p-6 shadow-lg border-1"
      >
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input w-full rounded-lg focus:border-content"
            />

            <label className="block mt-5 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 rounded-lg textarea bg-base-100 focus:border-content"
              rows={4}
            />

            <label className="block mt-5">
              <div className="text-sm">Due date</div>
              <input
                type="date"
                value={dueDate ? dueDate.split('T')[0] : ''}
                onChange={(e) =>
                  setDueDate(e.target.value ? new Date(e.target.value).toISOString() : null)
                }
                className="pika-single p-2 rounded-lg bg-base-100"
              />
            </label>

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
          submitLabel={initial?.id ? 'Save' : 'Create'}
        />
      </form>
    </div>
  );
}
