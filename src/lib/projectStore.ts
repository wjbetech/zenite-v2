'use client';

import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import api from './api';
import { sanitizeTitle, sanitizeDescription } from './text-format';

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  view?: 'list' | 'kanban' | 'grouped';
  starred?: boolean;
  taskCount?: number;
};

type State = {
  projects: Project[];
  createProject: (name: string) => Project;
  updateProject: (id: string, patch: Partial<Project>) => Project | undefined;
  deleteProject: (id: string) => void;
  setProjects: (p: Project[]) => void;
  toggleStar: (id: string) => void;
  loadRemote: () => Promise<void>;
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

export type RemoteProject = Partial<Project> & {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  createdAt?: unknown;
  taskCount?: unknown;
  tasks?: unknown;
  _count?: {
    tasks?: unknown;
  } | null;
};

export const normalizeRemoteProject = (raw: RemoteProject): Project => {
  const createdAtValue = raw.createdAt;
  let createdAt: string;
  if (typeof createdAtValue === 'string') {
    createdAt = createdAtValue;
  } else if (
    createdAtValue &&
    typeof createdAtValue === 'object' &&
    'toISOString' in createdAtValue &&
    typeof (createdAtValue as Date).toISOString === 'function'
  ) {
    createdAt = (createdAtValue as Date).toISOString();
  } else {
    createdAt = new Date().toISOString();
  }

  let taskCount: number | undefined = undefined;
  if (typeof raw.taskCount === 'number') {
    taskCount = raw.taskCount;
  } else if (raw._count && typeof raw._count.tasks === 'number') {
    taskCount = raw._count.tasks ?? 0;
  } else if (Array.isArray(raw.tasks)) {
    taskCount = raw.tasks.length;
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : '',
    name:
      typeof raw.name === 'string' && raw.name.trim().length > 0
        ? sanitizeTitle(raw.name)
        : 'Untitled',
    description:
      typeof raw.description === 'string' ? sanitizeDescription(raw.description) : undefined,
    createdAt,
    taskCount: taskCount ?? 0,
  };
};

const useProjectStore = create<State>((set, get) => ({
  projects: load(),
  setProjects(projects) {
    set({ projects });
    save(projects);
  },
  createProject(name) {
    const sanitized = sanitizeTitle(name);
    const p: Project = {
      id: nanoid(),
      name: sanitized,
      createdAt: new Date().toISOString(),
      view: 'list',
      starred: false,
      taskCount: 0,
    };
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
  toggleStar(id) {
    const projects = get().projects;
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const project = projects[idx];
    const updated = { ...project, starred: !project.starred };

    // Remove the project from the list
    const others = projects.filter((p) => p.id !== id);

    let newProjects: Project[];
    if (updated.starred) {
      // Move starred project to the top
      newProjects = [updated, ...others];
    } else {
      // Restore to its previous position (if possible) or put at top
      const insertAt = Math.min(idx, others.length);
      newProjects = [...others.slice(0, insertAt), updated, ...others.slice(insertAt)];
    }

    set({ projects: newProjects });
    save(newProjects);
  },
  async loadRemote() {
    try {
      const remote = await api.fetchProjects();
      if (Array.isArray(remote)) {
        const projects = (remote as RemoteProject[])
          .map((item) => normalizeRemoteProject(item))
          .filter((project): project is Project => Boolean(project.id));
        set({ projects });
        save(projects);
      }
    } catch (e) {
      console.error('failed to load remote projects', e);
    }
  },
}));

export default useProjectStore;
