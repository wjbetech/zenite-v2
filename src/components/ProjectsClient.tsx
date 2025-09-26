'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useProjectStore, { Project } from '../lib/projectStore';
import useTaskStore from '../lib/taskStore';
// import { Input } from './ui/input';
// ...existing code...
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import ProjectCard from './ProjectCard';
import ConfirmModal from './ConfirmModal';

type Props = {
  initialProjects: Project[];
};

export default function ProjectsClient({ initialProjects }: Props) {
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const setProjects = useProjectStore((s) => s.setProjects);
  const loadRemote = useProjectStore(
    (s) => (s as unknown as { loadRemote?: () => Promise<void> }).loadRemote,
  );

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(
    (initialProjects || []).map((p) => {
      const pp = p as Partial<Project>;
      return {
        ...(pp as Project),
        taskCount: typeof pp.taskCount === 'number' ? pp.taskCount : 0,
      } as Project;
    }),
  );
  const tasks = useTaskStore((s) => s.tasks);
  const usingRemoteDb = process.env.NEXT_PUBLIC_USE_REMOTE_DB === 'true';

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Defer setting the project store until we're on the client to avoid hydration mismatch.
    if (initialProjects && initialProjects.length > 0) {
      // we'll set the store on mount below
    }

    async function start() {
      if (process.env.NEXT_PUBLIC_USE_REMOTE_DB === 'true') {
        try {
          setLoading(true);
          if (loadRemote) await loadRemote();
        } catch (err) {
          console.warn('failed to load remote projects', err);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    }
    start();
    return () => {
      /* cleanup */
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // initialize client store with server-provided projects once, then mark mounted
    async function initProjects() {
      if (!initialProjects || initialProjects.length === 0) {
        // Server-side couldn't fetch projects (DB unreachable). Try to fetch from
        // the API endpoint directly; if that fails, fall back to a local demo list.
        try {
          const remote = (await fetch('/api/projects')
            .then((r) => r.json())
            .catch(() => null)) as unknown;
          if (Array.isArray(remote) && remote.length > 0) {
            type RemoteProject = {
              id: string;
              name: string;
              description?: string;
              createdAt?: string;
              taskCount?: number;
            };
            // ensure each item has numeric taskCount
            const rem = (remote as RemoteProject[]).map((r) => ({
              ...(r || {}),
              taskCount: typeof r.taskCount === 'number' ? r.taskCount : 0,
            }));
            setProjects(rem as Project[]);
            setDisplayedProjects(rem as Project[]);
            setMounted(true);
            return;
          }
        } catch {
          // fall through to demo fallback
        }

        // Fallback demo projects for offline/dev when DB is unreachable
        const demoProjects: Project[] = [
          {
            id: 'demo-getting-started',
            name: 'Getting Started',
            description: 'A demo project for local development',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-personal',
            name: 'Personal',
            description: 'Personal tasks and routines',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-work',
            name: 'Work',
            description: 'Work-related tasks and projects',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-backlog',
            name: 'Backlog',
            description: 'Ideas and backlog items',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'demo-chores',
            name: 'Chores',
            description: 'Household and maintenance tasks',
            createdAt: new Date().toISOString(),
          },
        ];

        setProjects(demoProjects);
        setDisplayedProjects(demoProjects);
        setMounted(true);
        return;
      }

      try {
        // Fast path: if server-side provided counts for all projects, use them and skip extra work.
        const allHaveCounts = (initialProjects as Project[]).every(
          (p) => typeof p.taskCount === 'number',
        );
        if (allHaveCounts) {
          setProjects(initialProjects as Project[]);
          setDisplayedProjects(initialProjects as Project[]);
          setMounted(true);
          return;
        }

        // Prefer the lightweight API that already includes per-project counts.
        try {
          const remote = (await fetch('/api/projects')
            .then((r) => r.json())
            .catch(() => null)) as unknown;
          if (Array.isArray(remote) && remote.length > 0) {
            type RemoteProject = {
              id: string;
              name: string;
              description?: string;
              createdAt?: string;
              taskCount?: number;
            };
            const rem = (remote as RemoteProject[]).map((r) => ({
              ...(r || {}),
              taskCount: typeof r.taskCount === 'number' ? r.taskCount : 0,
            }));
            setProjects(rem as Project[]);
            setDisplayedProjects(rem as Project[]);
            setMounted(true);
            // production and dev both continue without noisy console logs
            return;
          }
        } catch {
          // if /api/projects fails, fall back to fetching all tasks like before
        }

        // Fallback: fetch all tasks and compute counts (least efficient)
        const tasks = await api.fetchTasks().catch(() => []);
        type ApiTask = { id?: string; projectId?: string | null; project?: { id?: string } };
        const taskArr = Array.isArray(tasks) ? (tasks as ApiTask[]) : [];

        // Build counts map grouped by project id
        const counts = taskArr.reduce<Record<string, number>>((acc, t) => {
          const pid = (t && (t.projectId ?? t.project?.id)) || 'unassigned';
          if (!pid) return acc;
          acc[pid] = (acc[pid] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const merged = (initialProjects as Project[]).map((p) => ({
          ...p,
          taskCount: typeof p.taskCount === 'number' ? p.taskCount : counts[p.id] ?? 0,
        }));

        setProjects(merged);
        setDisplayedProjects(merged);
        setMounted(true);

        // silent in both production and development: we don't log task arrays here
      } catch (err) {
        // fallback: set projects as-is
        setProjects(initialProjects as Project[]);
        setDisplayedProjects(initialProjects as Project[]);
        setMounted(true);
        console.warn('ProjectsClient: failed to fetch tasks for counts', err);
      }
    }

    initProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localTaskCounts = useMemo(() => {
    return tasks.reduce<Record<string, number>>((acc, t) => {
      const pid = t.projectId ?? null;
      if (!pid) return acc;
      acc[pid] = (acc[pid] ?? 0) + 1;
      return acc;
    }, {});
  }, [tasks]);

  useEffect(() => {
    if (!mounted) return;
    if (usingRemoteDb) return;

    const storeProjects = useProjectStore.getState().projects;
    let changed = false;
    const next = storeProjects.map((p) => {
      const current = typeof p.taskCount === 'number' ? p.taskCount : 0;
      const nextCount = localTaskCounts[p.id] ?? current;
      if (nextCount !== current) changed = true;
      return { ...p, taskCount: nextCount };
    });

    if (!changed) {
      // ensure displayed projects still reflect the store state
      setDisplayedProjects(next);
      return;
    }

    setProjects(next as Project[]);
    setDisplayedProjects(next as Project[]);
  }, [mounted, localTaskCounts, setProjects, usingRemoteDb]);

  const create = () => {
    if (!name.trim()) return;
    createProject(name.trim());
    setName('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>

      {/* dev preview removed to avoid leaking large JSON into the UI */}

      <div className="mb-8 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="input mr-2"
        />
        <button
          onClick={create}
          className="btn btn-success py-3 flex items-center gap-2 border-neutral"
        >
          <Plus className="h-4 w-4" />
          <span className="leading-none">Create</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="col-span-full min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">Loading projects…</div>
          </div>
        ) : (mounted ? projects.length === 0 : (initialProjects?.length ?? 0) === 0) ? (
          <div className="col-span-full min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">- No projects yet! -</div>
          </div>
        ) : (
          (mounted ? displayedProjects : initialProjects).map((p) => {
            const name = p.name || '';
            const slug = name
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-');
            const href = `/projects/${slug}`;
            return (
              <div key={p.id} className="w-full">
                <ProjectCard
                  project={p as Project}
                  href={href}
                  onDelete={(id) => {
                    setPendingDeleteId(id);
                    setConfirmOpen(true);
                  }}
                />
              </div>
            );
          })
        )}
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Delete Project?"
        message="This will permanently remove the project and its tasks. Are you sure?"
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        loading={deleting}
        confirmLabel="Delete Project"
        onConfirm={async () => {
          if (!pendingDeleteId) return;
          setDeleting(true);
          try {
            if (process.env.NEXT_PUBLIC_USE_REMOTE_DB === 'true') {
              await api.deleteProject(pendingDeleteId);
            }
            // always update local store to keep UI in sync
            deleteProject(pendingDeleteId);
            // show styled toast like new-project toast
            toast.dismiss();
            toast.success('Project has been deleted', { autoClose: 4000, position: 'top-center' });
          } catch (err) {
            console.error('failed to delete project', err);
            toast.error(`Failed to delete project: ${String((err as Error).message ?? err)}`);
          } finally {
            setDeleting(false);
            setConfirmOpen(false);
            setPendingDeleteId(null);
          }
        }}
      />
    </div>
  );
}
