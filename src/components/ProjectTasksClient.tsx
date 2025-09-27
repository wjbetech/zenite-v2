'use client';

import React, { useEffect, useState } from 'react';
import TaskCard, { Task } from './TaskCard';
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

  if (loading) return <div>Loading tasks…</div>;

  if (dbUnavailable) {
    return (
      <div>
        <div className="text-sm text-red-600 font-semibold mb-2">
          The DB was not found - please contact your network administrator
        </div>
        <div className="text-sm text-gray-500">No tasks found!</div>
      </div>
    );
  }

  if (tasks.length === 0)
    return <div className="text-sm text-gray-500">No tasks for this project.</div>;

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  );
}
