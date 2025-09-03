'use client';

import create from 'zustand';
import { nanoid } from 'nanoid/non-secure';

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  createdAt: string;
  completed?: boolean;
  projectId?: string | null;
};

type State = {
  tasks: Task[];
  createTask: (payload: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => Task | undefined;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
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
      ...payload,
    };
    const tasks = [t, ...get().tasks];
    set({ tasks });
    save(tasks);
    return t;
  },
  updateTask(id, patch) {
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
    set({ tasks });
    save(tasks);
    return tasks.find((t) => t.id === id);
  },
  deleteTask(id) {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    save(tasks);
  },
}));

export default useTaskStore;
