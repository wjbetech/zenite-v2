'use client';

import React, { useEffect, useState } from 'react';
import useProjectStore, { Project } from '../lib/projectStore';
// import { Input } from './ui/input';
// ...existing code...
import { Plus } from 'lucide-react';
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

      <div className="mb-4 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="input mr-2"
        />
        <button
          onClick={create}
          className="btn btn-primary pl-1 py-3 flex items-center gap-2 w-[90px]"
        >
          <Plus className="h-4 w-4" />
          <span className="leading-none">Create</span>
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">Loading projects…</div>
          </div>
        ) : (mounted ? projects.length === 0 : (initialProjects?.length ?? 0) === 0) ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">- No projects yet! -</div>
          </div>
        ) : (
          (mounted ? projects : initialProjects).map((p) => (
            <div key={p.id}>
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
        title="Delete project"
        message="Are you sure you want to delete this project? This cannot be undone."
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (pendingDeleteId) deleteProject(pendingDeleteId);
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
