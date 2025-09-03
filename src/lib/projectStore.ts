'use client';

import create from 'zustand';
import { nanoid } from 'nanoid/non-secure';

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  view?: 'list' | 'kanban' | 'grouped';
};

type State = {
  projects: Project[];
  createProject: (name: string) => Project;
  updateProject: (id: string, patch: Partial<Project>) => Project | undefined;
  deleteProject: (id: string) => void;
  setProjects: (p: Project[]) => void;
};

const STORAGE_KEY = 'zenite:projects:v1';

const load = (): Project[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch (e) {
    console.error('failed to load projects', e);
    return [];
  }
};

const save = (projects: Project[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('failed to save projects', e);
  }
};

const useProjectStore = create<State>((set, get) => ({
  projects: load(),
  setProjects(projects) {
    set({ projects });
    save(projects);
  },
  createProject(name) {
    const p: Project = { id: nanoid(), name, createdAt: new Date().toISOString(), view: 'list' };
    const projects = [p, ...get().projects];
    set({ projects });
    save(projects);
    return p;
  },
  updateProject(id, patch) {
    const projects = get().projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
    set({ projects });
    save(projects);
    return projects.find((p) => p.id === id);
  },
  deleteProject(id) {
    const projects = get().projects.filter((p) => p.id !== id);
    set({ projects });
    save(projects);
  },
}));

export default useProjectStore;
