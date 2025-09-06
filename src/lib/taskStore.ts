'use client';

import create from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import api from './api';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  recurrence?: string | null;
  createdAt: string;
  completed?: boolean;
  started?: boolean;
  projectId?: string | null;
  ownerId?: string;
};

type State = {
  tasks: Task[];
  createTask: (payload: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => Task | undefined;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  loadRemote?: () => Promise<void>;
};

const STORAGE_KEY = 'zenite:tasks:v1';

const load = (): Task[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch (e) {
    console.error('failed to load tasks', e);
    return [];
  }
};

const save = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('failed to save tasks', e);
  }
};

export const useTaskStore = create<State>((set, get) => ({
  tasks: load(),
  setTasks(tasks) {
    set({ tasks });
    save(tasks);
  },
  createTask(payload) {
    const t: Task = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      completed: false,
      started: false,
      ...payload,
    };
    const tasks = [t, ...get().tasks];
    set({ tasks });
    save(tasks);
    return t;
  },
  updateTask(id, patch) {
    console.log('taskStore.updateTask called', { id, patch });
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
    console.log('taskStore.updateTask before set', { tasks });
    set({ tasks });
    save(tasks);
    const updated = tasks.find((t) => t.id === id);
    console.log('taskStore.updateTask updated', { updated });
    return updated;
  },
  deleteTask(id) {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    save(tasks);
  },
  async loadRemote() {
    try {
      if (process.env.NEXT_PUBLIC_USE_REMOTE_DB === 'true') {
        const remote = await api.fetchTasks();
        if (Array.isArray(remote)) {
          const arr = remote as Array<Record<string, unknown>>;
          const tasks = arr.map((r) => {
            return {
              id: (r.id as string) || '',
              title: (r.title as string) || 'Untitled',
              notes: (r.description as string) || (r.notes as string) || undefined,
              createdAt: (r.createdAt as string) || new Date().toISOString(),
              completed: !!r.completed,
              projectId: (r.projectId as string) ?? null,
              recurrence: (r.recurrence as string) ?? null,
              ownerId: (r.ownerId as string) ?? undefined,
            } as Partial<Task> as Task;
          });
          set({ tasks });
          save(tasks);
        }
      }
    } catch (e) {
      console.error('failed to load remote tasks', e);
    }
  },
}));

export default useTaskStore;
