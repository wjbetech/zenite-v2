'use client';

import React, { useEffect, useState } from 'react';
import useProjectStore, { Project } from '../lib/projectStore';
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
    // mark mounted and initialize client store with server-provided projects once
    setMounted(true);
    if (initialProjects && initialProjects.length > 0) {
      setProjects(initialProjects as Project[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = () => {
    if (!name.trim()) return;
    createProject(name.trim());
    setName('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">Loading projects…</div>
          </div>
        ) : (mounted ? projects.length === 0 : (initialProjects?.length ?? 0) === 0) ? (
          <div className="col-span-full min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">- No projects yet! -</div>
          </div>
        ) : (
          (mounted ? projects : initialProjects).map((p) => (
            <div key={p.id} className="h-full">
              <ProjectCard
                project={p}
                onDelete={(id) => {
                  setPendingDeleteId(id);
                  setConfirmOpen(true);
                }}
              />
            </div>
          ))
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
