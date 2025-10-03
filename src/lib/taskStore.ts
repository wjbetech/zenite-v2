'use client';

import { create } from 'zustand';
import api, { UpdateTaskPayload } from './api';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  recurrence?: string | null;
  createdAt: string;
  completed?: boolean;
  completedAt?: string | null;
  started?: boolean;
  projectId?: string | null;
  ownerId?: string;
};

export type CreateTaskInput = {
  title: string;
  notes?: string;
  dueDate?: string | null;
  recurrence?: string | null;
  projectId?: string | null;
  started?: boolean;
  completed?: boolean;
  completedAt?: string | null;
};

type State = {
  tasks: Task[];
  loading: boolean;
  error?: string | null;
  setTasks: (tasks: Task[]) => void;
  loadTasks: () => Promise<void>;
  createTask: (payload: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  resetDailiesIfNeeded: () => Promise<void>;
  resetDailiesNow: () => Promise<void>;
};

const LAST_DAILY_RESET_KEY = 'zenite:dailies:lastReset:v1';

const todayKey = () => new Date().toISOString().slice(0, 10);

const mapRemoteTask = (remote: Record<string, unknown>): Task => ({
  id: (remote.id as string) ?? '',
  title: (remote.title as string) ?? 'Untitled',
  notes: (remote.notes as string) ?? undefined,
  dueDate: (remote.dueDate as string | null | undefined) ?? null,
  recurrence: (remote.recurrence as string | null | undefined) ?? null,
  createdAt: (remote.createdAt as string) ?? new Date().toISOString(),
  completed: remote.completed === true,
  completedAt: (remote.completedAt as string | null | undefined) ?? null,
  started: remote.started === true,
  projectId: (remote.projectId as string | null | undefined) ?? null,
  ownerId: (remote.ownerId as string | undefined) ?? undefined,
});

const useTaskStore = create<State>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  setTasks(tasks) {
    set({ tasks });
  },

  async loadTasks() {
    set({ loading: true, error: null });
    try {
      const remote = await api.fetchTasks();
      if (!Array.isArray(remote)) {
        throw new Error('Unexpected response while loading tasks');
      }
      const tasks = remote.map((item) => mapRemoteTask(item as Record<string, unknown>));
      set({ tasks, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks';
      console.error('taskStore.loadTasks failed', err);
      set({ error: message, loading: false });
    }
  },

  async createTask(payload) {
    const response = await api.createTask({
      title: payload.title,
      description: payload.notes,
      dueDate: payload.dueDate ?? null,
      recurrence: payload.recurrence ?? null,
      projectId: payload.projectId ?? null,
      started: payload.started,
      completed: payload.completed,
      completedAt: payload.completedAt ?? null,
    });
    const created = mapRemoteTask(response as Record<string, unknown>);
    set({ tasks: [created, ...get().tasks] });
    return created;
  },

  async updateTask(id, patch) {
    const payload: UpdateTaskPayload = { id };

    if (patch.title !== undefined) {
      payload.title = patch.title;
    }
    if (patch.notes !== undefined) {
      payload.notes = patch.notes;
      payload.description = patch.notes;
    }
    if (patch.dueDate !== undefined) {
      payload.dueDate = patch.dueDate;
    }
    if (patch.recurrence !== undefined) {
      payload.recurrence = patch.recurrence;
    }
    if (patch.projectId !== undefined) {
      payload.projectId = patch.projectId;
    }
    if (patch.ownerId !== undefined) {
      payload.ownerId = patch.ownerId;
    }
    if (patch.started !== undefined) {
      payload.started = patch.started;
    }
    if (patch.completed !== undefined) {
      payload.completed = patch.completed;
    }
    if (patch.completedAt !== undefined) {
      payload.completedAt = patch.completedAt;
    }

    const response = await api.updateTask(payload);
    const updated = mapRemoteTask(response as Record<string, unknown>);
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, ...updated } : t));
    set({ tasks });
    return updated;
  },

  async deleteTask(id) {
    await api.deleteTask(id);
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
  },

  async resetDailiesIfNeeded() {
    if (typeof window === 'undefined') return;
    try {
      const last = window.localStorage.getItem(LAST_DAILY_RESET_KEY);
      const today = todayKey();
      if (last !== today) {
        await get().resetDailiesNow();
      }
    } catch (err) {
      console.error('resetDailiesIfNeeded failed', err);
    }
  },

  async resetDailiesNow() {
    const today = todayKey();
    const dailyTasks = get().tasks.filter((t) => (t.recurrence ?? 'once') === 'daily');
    // Also capture completed one-off tasks so we can snapshot them and remove them
    const completedOneOff = get()
      .tasks.filter((t) => (t.recurrence ?? 'once') !== 'daily')
      .filter((t) => t.completed);
    try {
      // Snapshot today's completions for activity tracking before resetting.
      const completedDailyItems = dailyTasks
        .filter((t) => t.completed)
        .map((t) => ({ taskId: t.id, taskTitle: t.title, ownerId: t.ownerId }));
      const completedOneOffItems = completedOneOff.map((t) => ({
        taskId: t.id,
        taskTitle: t.title,
        ownerId: t.ownerId,
      }));

      // Post daily completions (persisted as historical activity)
      if (completedDailyItems.length > 0) {
        try {
          await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: today, items: completedDailyItems }),
          });
        } catch (err) {
          console.error('resetDailiesNow: failed to persist daily activity snapshot', err);
        }
      }

      // Post completed one-off tasks as part of today's activity then delete them from the client list
      if (completedOneOffItems.length > 0) {
        try {
          await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: today, items: completedOneOffItems }),
          });
        } catch (err) {
          console.error(
            'resetDailiesNow: failed to persist one-off completed activity snapshot',
            err,
          );
        }
      }

      // Reset daily tasks on the server
      await Promise.all(
        dailyTasks.map((task) =>
          api.updateTask({
            id: task.id,
            started: false,
            completed: false,
            completedAt: null,
          }),
        ),
      );
      // Delete one-off completed tasks on the server
      await Promise.all(completedOneOff.map((task) => api.deleteTask(task.id)));
    } catch (err) {
      console.error('resetDailiesNow sync failed', err);
    }
    // Refresh client-side tasks: reset daily tasks, and remove completed one-off tasks
    const refreshed = get()
      .tasks.filter((t) => !completedOneOff.find((o) => o.id === t.id))
      .map((t) =>
        (t.recurrence ?? 'once') === 'daily'
          ? { ...t, started: false, completed: false, completedAt: null }
          : t,
      );
    set({ tasks: refreshed });
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LAST_DAILY_RESET_KEY, today);
      }
    } catch (err) {
      console.error('resetDailiesNow persist failed', err);
    }
  },
}));

export default useTaskStore;
