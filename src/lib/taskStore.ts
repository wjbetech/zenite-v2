'use client';

import { create } from 'zustand';
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
  // ISO timestamp when task was marked completed. Optional for older/local tasks.
  completedAt?: string | null;
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
  // Reset helpers for daily recurrence handling
  resetDailiesIfNeeded: () => void;
  resetDailiesNow: () => void;
  loadRemote?: () => Promise<void>;
};

const STORAGE_KEY = 'zenite:tasks:v1';
const LAST_DAILY_RESET_KEY = 'zenite:dailies:lastReset:v1';

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

const todayKey = () => new Date().toISOString().slice(0, 10);

export const useTaskStore = create<State>((set, get) => {
  // Load tasks and perform an initial daily reset if needed without calling set during module init
  const initial = load();
  let startingTasks = initial;
  try {
    if (typeof window !== 'undefined') {
      const last = localStorage.getItem(LAST_DAILY_RESET_KEY);
      const today = todayKey();
      if (last !== today) {
        startingTasks = initial.map((t) =>
          (t.recurrence ?? 'once') === 'daily' ? { ...t, completed: false, started: false } : t,
        );
        save(startingTasks);
        try {
          localStorage.setItem(LAST_DAILY_RESET_KEY, today);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    tasks: startingTasks,

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
      const tasks = get().tasks.map((t) => {
        if (t.id !== id) return t;
        // compute completedAt semantics: if patch explicitly provides completedAt, use it.
        // Otherwise, if patch.completed === true and task was not previously completed, set completedAt to now.
        // If patch.completed === false, clear completedAt.
        const next = { ...t, ...patch } as Task;
        if (patch.completed === true && !t.completed && patch.completedAt === undefined) {
          next.completedAt = new Date().toISOString();
        }
        if (patch.completed === false && patch.completedAt === undefined) {
          next.completedAt = null;
        }
        return next;
      });
      set({ tasks });
      save(tasks);
      return tasks.find((t) => t.id === id);
    },

    deleteTask(id) {
      const tasks = get().tasks.filter((t) => t.id !== id);
      set({ tasks });
      save(tasks);
    },

    resetDailiesIfNeeded() {
      try {
        if (typeof window === 'undefined') return;
        const last = localStorage.getItem(LAST_DAILY_RESET_KEY);
        const today = todayKey();
        if (last !== today) {
          get().resetDailiesNow();
        }
      } catch {
        // ignore
      }
    },

    resetDailiesNow() {
      const today = todayKey();
      const tasks = get().tasks.map((t) =>
        (t.recurrence ?? 'once') === 'daily' ? { ...t, completed: false, started: false } : t,
      );
      set({ tasks });
      save(tasks);
      try {
        localStorage.setItem(LAST_DAILY_RESET_KEY, today);
      } catch {
        // ignore
      }
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
                completedAt: (r.completedAt as string) || null,
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
  };
});

export default useTaskStore;
