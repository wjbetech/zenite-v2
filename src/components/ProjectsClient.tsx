'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useProjectStore, {
  Project,
  RemoteProject,
  normalizeRemoteProject,
} from '../lib/projectStore';
// import { Input } from './ui/input';
// ...existing code...
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import ProjectCard from './ProjectCard';
import ConfirmModal from './ConfirmModal';
import ProjectModal from '@/components/ProjectModal';
import { projectSlug } from '../lib/utils';

type Props = {
  initialProjects: Project[];
};

export default function ProjectsClient({ initialProjects }: Props) {
  const projects = useProjectStore((s) => s.projects);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const setProjects = useProjectStore((s) => s.setProjects);

  const [loading, setLoading] = useState(false);
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
  const [dbUnavailable, setDbUnavailable] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    setDisplayedProjects(projects);
  }, [projects, mounted]);

  useEffect(() => {
    let cancelled = false;

    const commitProjects = (list: Project[], options?: { dbAvailable?: boolean }) => {
      if (cancelled) return;
      setProjects(list);
      setDisplayedProjects(list);
      setMounted(true);
      if (options && options.dbAvailable !== undefined) {
        setDbUnavailable(!options.dbAvailable);
      }
    };

    async function initProjects() {
      setLoading(true);
      try {
        if (!initialProjects || initialProjects.length === 0) {
          const remote = (await fetch('/api/projects')
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)) as unknown;
          if (Array.isArray(remote)) {
            const remapped = (remote as RemoteProject[])
              .map((item) => normalizeRemoteProject(item))
              .filter((project): project is Project => Boolean(project.id));
            commitProjects(remapped, { dbAvailable: true });
            return;
          }

          commitProjects([], { dbAvailable: false });
          return;
        }

        const allHaveCounts = (initialProjects as Project[]).every(
          (p) => typeof p.taskCount === 'number',
        );
        if (allHaveCounts) {
          commitProjects(initialProjects as Project[], { dbAvailable: true });
          return;
        }

        const remote = (await fetch('/api/projects')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)) as unknown;
        if (Array.isArray(remote) && remote.length > 0) {
          const remapped = (remote as RemoteProject[])
            .map((item) => normalizeRemoteProject(item))
            .filter((project): project is Project => Boolean(project.id));
          commitProjects(remapped, { dbAvailable: true });
          return;
        }

        const tasks = await api.fetchTasks().catch(() => []);
        type ApiTask = { id?: string; projectId?: string | null; project?: { id?: string } };
        const taskArr = Array.isArray(tasks) ? (tasks as ApiTask[]) : [];

        const counts = taskArr.reduce<Record<string, number>>((acc, task) => {
          const pid = (task && (task.projectId ?? task.project?.id)) || null;
          if (!pid) return acc;
          acc[pid] = (acc[pid] ?? 0) + 1;
          return acc;
        }, {});

        const merged = (initialProjects as Project[]).map((project) => ({
          ...project,
          taskCount:
            typeof project.taskCount === 'number' ? project.taskCount : counts[project.id] ?? 0,
        }));

        commitProjects(merged, { dbAvailable: true });
      } catch (err) {
        console.warn('ProjectsClient: failed to fetch projects; showing initial data', err);
        commitProjects(initialProjects ? (initialProjects as Project[]) : [], {
          dbAvailable: true,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initProjects();

    return () => {
      cancelled = true;
    };
  }, [initialProjects, setProjects]);

  const handleCreateProject = useCallback(
    async ({ name, description }: { name: string; description?: string }) => {
      const trimmedName = name.trim();
      const trimmedDescription = description?.trim();
      if (!trimmedName) {
        throw new Error('Project name is required');
      }

      const store = useProjectStore.getState();

      try {
        const response = (await api.createProject({
          name: trimmedName,
          description: trimmedDescription || undefined,
        })) as Record<string, unknown>;

        const normalized = normalizeRemoteProject(response as RemoteProject);
        if (!normalized.id) {
          throw new Error('The server returned a project without an id');
        }

        const current = store.projects;
        const nextProjects = [normalized, ...current.filter((p) => p.id !== normalized.id)];
        store.setProjects(nextProjects);
        setDisplayedProjects(nextProjects);
        setMounted(true);
        setDbUnavailable(false);

        setCreateModalOpen(false);
        toast.dismiss();
        toast.success('Project created', { autoClose: 4000, position: 'top-center' });
      } catch (err) {
        console.error('ProjectsClient: failed to create project', err);
        setDbUnavailable(true);
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Failed to create project');
      }
    },
    [],
  );

  const handleEditProject = useCallback(
    async (payload: { id: string; name?: string; description?: string | null }) => {
      const trimmedName = payload.name?.trim();
      const trimmedDescription =
        typeof payload.description === 'string'
          ? payload.description.trim()
          : payload.description ?? null;
      if (!trimmedName) throw new Error('Project name is required');

      try {
        const updated = (await api.updateProject({
          id: payload.id,
          name: trimmedName,
          description: trimmedDescription,
        })) as Record<string, unknown>;
        const normalized = normalizeRemoteProject(updated as RemoteProject);
        if (!normalized.id) throw new Error('Server returned invalid project');
        // update store
        const store = useProjectStore.getState();
        const next = store.projects.map((p) =>
          p.id === normalized.id ? { ...p, ...normalized } : p,
        );
        store.setProjects(next);
        setDisplayedProjects(next);
        setEditModalOpen(false);
        setEditingProjectId(null);
        toast.dismiss();
        toast.success('Project updated', { autoClose: 3000, position: 'top-center' });
      } catch (err) {
        console.error('ProjectsClient: failed to update project', err);
        setDbUnavailable(true);
        if (err instanceof Error) throw err;
        throw new Error('Failed to update project');
      }
    },
    [],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-x-visible px-6 pt-[124px]">
      <header className="pb-6 px-3">
        <div className="mx-auto w-full max-w-6xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <h1 className="display-font text-3xl font-semibold mb-0 text-emerald-600">Projects</h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="btn btn-success border-success-content text-success-content py-3 flex items-center gap-2 border-2"
              >
                <Plus className="h-4 w-4" />
                <span className="leading-none">New Project</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 pb-10 px-3">
        {loading ? (
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
              <div className="mt-3 text-sm text-base-content/50">Loading projects…</div>
            </div>
          </div>
        ) : dbUnavailable ? (
          <div className="col-span-full min-h-[60vh] flex items-center justify-center">
            <div className="text-center text-base-content/50">
              <p>
                Unable to load tasks — the database may be unavailable. Check your local DB and try
                again, or contact the administrator (wjbetech@gmail.com)
              </p>
            </div>
          </div>
        ) : (mounted ? projects.length === 0 : (initialProjects?.length ?? 0) === 0) ? (
          <div className="col-span-full min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">- No projects yet! -</div>
          </div>
        ) : (
          (mounted ? displayedProjects : initialProjects).map((p) => {
            const slug = projectSlug(p.name);
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
                  onEdit={(id) => {
                    setEditingProjectId(id);
                    setEditModalOpen(true);
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
            await api.deleteProject(pendingDeleteId);
            deleteProject(pendingDeleteId);
            setDbUnavailable(false);
            toast.dismiss();
            toast.success('Project has been deleted', { autoClose: 4000, position: 'top-center' });
          } catch (err) {
            console.error('failed to delete project', err);
            setDbUnavailable(true);
            toast.error(`Failed to delete project: ${String((err as Error).message ?? err)}`);
          } finally {
            setDeleting(false);
            setConfirmOpen(false);
            setPendingDeleteId(null);
          }
        }}
      />

      <ProjectModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
      <ProjectModal
        open={editModalOpen}
        initial={displayedProjects.find((pr) => pr.id === editingProjectId) ?? undefined}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingProjectId(null);
        }}
        onSubmit={async (payload) => {
          if (!editingProjectId) return;
          await handleEditProject({ id: editingProjectId, ...payload });
        }}
      />
    </div>
  );
}
