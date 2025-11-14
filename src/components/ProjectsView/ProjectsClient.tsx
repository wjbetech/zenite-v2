'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useProjectStore, {
  Project,
  RemoteProject,
  normalizeRemoteProject,
} from '../../lib/projectStore';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';
import { createProjectAndUpdateStore } from './projectsClientActions';
import { isDbUnavailableError, extractErrorMessage } from '../../lib/db-error';
import ProjectsList from './ProjectsList';
import ProjectsLoading from './ProjectsLoading';
import ProjectsDbUnavailable from './ProjectsDbUnavailable';
import ProjectsEmpty from './ProjectsEmpty';
import useProjectsInitializer from './useProjectsInitializer';
import ConfirmModal from '../modals/ConfirmProjectDeleteModal';
import ProjectModal from './ProjectModal';

type Props = {
  initialProjects: Project[];
};

export default function ProjectsClient({ initialProjects }: Props) {
  const projects = useProjectStore((s) => s.projects);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const {
    displayedProjects,
    setDisplayedProjects,
    loading,
    mounted,
    setMounted,
    dbUnavailable,
    setDbUnavailable,
  } = useProjectsInitializer(initialProjects);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    setDisplayedProjects(projects);
  }, [projects, mounted, setDisplayedProjects]);

  // initialization logic handled by useProjectsInitializer hook

  const handleCreateProject = useCallback(
    async ({ name, description }: { name: string; description?: string }) => {
      try {
        const normalized = await createProjectAndUpdateStore({ name, description });
        const store = useProjectStore.getState();
        const nextProjects = [normalized, ...store.projects.filter((p) => p.id !== normalized.id)];
        setDisplayedProjects(nextProjects);
        setMounted(true);
        setDbUnavailable(false);

        setCreateModalOpen(false);
        toast.dismiss();
        toast.success('Project created', { autoClose: 4000, position: 'top-center' });
      } catch (err) {
        console.error('ProjectsClient: failed to create project', extractErrorMessage(err));
        if (isDbUnavailableError(err)) setDbUnavailable(true);
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Failed to create project');
      }
    },
    [setDbUnavailable, setDisplayedProjects, setMounted],
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
        console.error('ProjectsClient: failed to update project', extractErrorMessage(err));
        if (isDbUnavailableError(err)) setDbUnavailable(true);
        if (err instanceof Error) throw err;
        throw new Error('Failed to update project');
      }
    },
    [setDbUnavailable, setDisplayedProjects],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-x-visible pt-[var(--nav-height)]">
      <header className="pb-6 flex-shrink-0">
        <div
          className="mx-auto w-full px-0"
          style={{ maxWidth: 'calc(100vw - var(--sidebar-width) - 3rem)', boxSizing: 'border-box' }}
        >
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

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible px-2 pt-4 mb-10">
          <div className="flex flex-col gap-6 pr-2">
          {loading ? (
            <ProjectsLoading />
          ) : dbUnavailable ? (
            <ProjectsDbUnavailable />
          ) : (mounted ? projects.length === 0 : (initialProjects?.length ?? 0) === 0) ? (
            <ProjectsEmpty />
          ) : (
            <ProjectsList
              projects={mounted ? displayedProjects : initialProjects ?? []}
              onDelete={(id) => {
                setPendingDeleteId(id);
                setConfirmOpen(true);
              }}
              onEdit={(id) => {
                setEditingProjectId(id);
                setEditModalOpen(true);
              }}
            />
          )}
        </div>
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
            console.error('failed to delete project', extractErrorMessage(err));
            if (isDbUnavailableError(err)) setDbUnavailable(true);
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
