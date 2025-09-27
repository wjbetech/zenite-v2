'use client';

import React, { useEffect, useState } from 'react';
import TaskCard, { Task } from './TaskCard';
import { useTaskStore } from '../lib/taskStore';

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

  const usingRemoteDb = process.env.NEXT_PUBLIC_USE_REMOTE_DB === 'true';
  const localTasks = useTaskStore((s) => s.tasks);

  useEffect(() => {
    let mounted = true;

    async function loadRemote() {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/tasks`)
          .then((r) => r.json())
          .catch(() => []);
        const arr = Array.isArray(res) ? (res as ApiTask[]) : ([] as ApiTask[]);
        const mapped: Task[] = arr.map((t) => ({
          id: t.id,
          title: t.title,
          notes: t.description ?? undefined,
          dueDate: t.dueDate ?? null,
          createdAt: t.createdAt,
          completed: !!t.completedAt,
        }));
        if (mounted) setTasks(mapped);
      } catch (e) {
        console.warn('ProjectTasksClient: failed to fetch tasks', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (usingRemoteDb) {
      loadRemote();
      return () => {
        mounted = false;
      };
    }

    // When not using the remote DB, derive tasks from the local store so counts match
    const derived = localTasks
      .filter((t) => t.projectId === projectId)
      .map((t) => ({
        id: t.id,
        title: t.title,
        notes: t.notes,
        dueDate: t.dueDate ?? null,
        createdAt: t.createdAt,
        completed: !!t.completed,
      }));
    setTasks(derived);
    setLoading(false);

    return () => {
      mounted = false;
    };
  }, [projectId, localTasks, usingRemoteDb]);

  if (loading) return <div>Loading tasks…</div>;
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
