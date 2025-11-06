'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TaskSection from '../TaskSection';
import EditTaskModal from '../modals/EditTaskModal';
import type { Task } from '../TaskCard';
import api from '../../lib/api';
import { isDbUnavailableError, extractErrorMessage } from '../../lib/db-error';
import DataLoading from '../ui/DataLoading';

// local task store is no longer used here; always prefer server

type Props = {
  projectId: string;
};

type ApiTask = {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  startsAt?: string | null;
  estimatedDuration?: number | string | null;
  createdAt: string;
  completedAt?: string | null;
};

export default function ProjectTasksClient({ projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbUnavailable, setDbUnavailable] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRemote() {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/tasks`);
        if (!response.ok) {
          // non-OK response, treat as DB unavailable for 5xx or db-specific errors
          if (isDbUnavailableError(null, response)) {
            setDbUnavailable(true);
            if (mounted) setTasks([]);
            return;
          }
          // otherwise fallthrough and try to parse body as empty
        }
        const res = await response.json().catch(() => []);
        const arr = Array.isArray(res) ? (res as ApiTask[]) : ([] as ApiTask[]);
        const mapped: Task[] = arr.map((t) => ({
          id: t.id,
          title: t.title,
          notes: t.description ?? undefined,
          dueDate: t.dueDate ?? null,
          dueTime: (t as ApiTask).dueTime ?? null,
          startsAt: (t as ApiTask).startsAt ?? null,
          estimatedDuration: (() => {
            const v = (t as ApiTask).estimatedDuration;
            if (typeof v === 'number') return v as number;
            if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)))
              return Number(v);
            return undefined;
          })(),
          createdAt: t.createdAt,
          completed: !!t.completedAt,
          // Bind the projectId so TaskSection / TaskCard can render the project badge
          projectId,
        }));
        if (mounted) {
          setTasks(mapped);
          setDbUnavailable(false);
        }
      } catch (e) {
        console.warn('ProjectTasksClient: failed to fetch tasks', extractErrorMessage(e));
        if (mounted && isDbUnavailableError(e)) setDbUnavailable(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRemote();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const handleStatusChange = useCallback(
    async (id: string, status: 'none' | 'done' | 'tilde') => {
      const nowIso = new Date().toISOString();
      const patch =
        status === 'tilde'
          ? { started: true, completed: false, completedAt: null }
          : status === 'done'
          ? { started: false, completed: true, completedAt: nowIso }
          : { started: false, completed: false, completedAt: null };

      try {
        const updated = await api.updateTask({ id, ...patch });
        const payload = updated as Partial<ApiTask> & {
          completed?: boolean;
          notes?: string | null;
        };
        const updatedTask: Task = {
          id: payload.id ?? '',
          title: payload.title ?? 'Untitled',
          notes: payload.notes ?? undefined,
          dueDate: payload.dueDate ?? null,
          dueTime: (payload as ApiTask).dueTime ?? null,
          startsAt: (payload as ApiTask).startsAt ?? null,
          estimatedDuration: (() => {
            const v = (payload as ApiTask).estimatedDuration;
            if (typeof v === 'number') return v as number;
            if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)))
              return Number(v);
            return undefined;
          })(),
          createdAt: payload.createdAt ?? new Date().toISOString(),
          completed: !!payload.completed,
          // ensure we also reflect the started flag returned by the API
          started: !!(payload as unknown as { started?: boolean }).started,
          // preserve project context so TaskCard shows the connected project
          projectId,
        };
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
      } catch (err) {
        console.error('ProjectTasksClient: failed to update task status', err);
      }
    },
    [projectId],
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('ProjectTasksClient: failed to delete task', err);
    }
  }, []);

  const handleEdit = useCallback(
    (t: Partial<Task> | undefined) => {
      if (!t) return;
      // t may be a partial object; find full task from local list when possible
      const full = tasks.find((x) => x.id === (t as Task).id) ?? (t as Task);
      setEditingTask(full ?? null);
      setEditOpen(true);
    },
    [tasks],
  );

  const handleSave = useCallback(
    async (id: string, patch: Partial<Task>) => {
      try {
        const updated = await api.updateTask({ id, ...patch });
        const payload = updated as Partial<ApiTask> & {
          notes?: string | null;
          completed?: boolean;
        };
        const updatedTask: Task = {
          id: payload.id ?? id,
          title: payload.title ?? 'Untitled',
          notes: payload.notes ?? undefined,
          dueDate: payload.dueDate ?? null,
          dueTime: (payload as ApiTask).dueTime ?? null,
          startsAt: (payload as ApiTask).startsAt ?? null,
          estimatedDuration: (() => {
            const v = (payload as ApiTask).estimatedDuration;
            if (typeof v === 'number') return v as number;
            if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)))
              return Number(v);
            return undefined;
          })(),
          createdAt: payload.createdAt ?? new Date().toISOString(),
          completed: !!payload.completed,
          // ensure project association remains for rendering
          projectId,
        };
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
      } catch (err) {
        console.error('ProjectTasksClient: failed to save edited task', err);
      } finally {
        setEditOpen(false);
        setEditingTask(null);
      }
    },
    [projectId],
  );

  if (loading) return <DataLoading label="Loading tasks…" variant="accent" />;

  if (dbUnavailable) {
    return (
      <div className="col-span-full min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-base-content/50">
          <p>
            Unable to load tasks — the database may be unavailable. Check your local DB and try
            again, or contact the administrator (wjbetech@gmail.com)
          </p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0)
    return <div className="text-sm text-gray-500">No tasks for this project.</div>;

  return (
    <>
      <TaskSection
        tasks={tasks}
        onEdit={(t) => handleEdit(t)}
        onDelete={(id) => handleDelete(id)}
        onStatusChange={(id, status) => void handleStatusChange(id, status)}
      />

      <EditTaskModal
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditingTask(null);
        }}
        task={editingTask}
        onSave={(id, patch) => void handleSave(id, patch)}
      />
    </>
  );
}
