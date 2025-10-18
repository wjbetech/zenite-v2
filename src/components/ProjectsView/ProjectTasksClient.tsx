'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TaskSection from '../TaskSection';
import type { Task } from '../TaskCard';
import api from '../../lib/api';

// local task store is no longer used here; always prefer server

type Props = {
  projectId: string;
};

type ApiTask = {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

export default function ProjectTasksClient({ projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbUnavailable, setDbUnavailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRemote() {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/tasks`);
        if (!response.ok) {
          // non-OK response, treat as DB unavailable
          setDbUnavailable(true);
          if (mounted) setTasks([]);
          return;
        }
        const res = await response.json().catch(() => []);
        const arr = Array.isArray(res) ? (res as ApiTask[]) : ([] as ApiTask[]);
        const mapped: Task[] = arr.map((t) => ({
          id: t.id,
          title: t.title,
          notes: t.description ?? undefined,
          dueDate: t.dueDate ?? null,
          createdAt: t.createdAt,
          completed: !!t.completedAt,
        }));
        if (mounted) {
          setTasks(mapped);
          setDbUnavailable(false);
        }
      } catch (e) {
        console.warn('ProjectTasksClient: failed to fetch tasks', e);
        if (mounted) setDbUnavailable(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRemote();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const handleStatusChange = useCallback(async (id: string, status: 'none' | 'done' | 'tilde') => {
    const nowIso = new Date().toISOString();
    const patch =
      status === 'tilde'
        ? { started: true, completed: false, completedAt: null }
        : status === 'done'
        ? { started: false, completed: true, completedAt: nowIso }
        : { started: false, completed: false, completedAt: null };

    try {
      const updated = await api.updateTask({ id, ...patch });
      const payload = updated as Partial<ApiTask> & { completed?: boolean; notes?: string | null };
      const updatedTask: Task = {
        id: payload.id ?? '',
        title: payload.title ?? 'Untitled',
        notes: payload.notes ?? undefined,
        dueDate: payload.dueDate ?? null,
        createdAt: payload.createdAt ?? new Date().toISOString(),
        completed: !!payload.completed,
        // ensure we also reflect the started flag returned by the API
        started: !!(payload as unknown as { started?: boolean }).started,
      };
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
    } catch (err) {
      console.error('ProjectTasksClient: failed to update task status', err);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('ProjectTasksClient: failed to delete task', err);
    }
  }, []);

  if (loading)
    return (
      <div className="col-span-full min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-accent"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <div className="mt-3 text-sm text-base-content/50">Loading tasks…</div>
        </div>
      </div>
    );

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
    <TaskSection
      tasks={tasks}
      onDelete={(id) => handleDelete(id)}
      onStatusChange={(id, status) => void handleStatusChange(id, status)}
    />
  );
}
