'use client';

import React, { useEffect, useState } from 'react';
import useProjectStore, { Project } from '../lib/projectStore';
import { Input } from './ui/input';
import { Button } from './ui/Button';
import { Check, Trash, Plus } from 'lucide-react';

type Status = 'none' | 'tilde' | 'done';

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
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  useEffect(() => {
    let mounted = true;
    if (initialProjects && initialProjects.length > 0) {
      setProjects(initialProjects as Project[]);
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
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = () => {
    if (!name.trim()) return;
    createProject(name.trim());
    setName('');
  };

  const cycleStatus = (id: string) => {
    setStatuses((s) => {
      const curr = s[id] ?? 'none';
      const next: Status = curr === 'none' ? 'tilde' : curr === 'tilde' ? 'done' : 'none';
      return { ...s, [id]: next };
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>

      <div className="mb-4 flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="mr-2"
        />
        <Button
          variant="primary"
          onClick={create}
          className="pl-1 py-3 flex items-center gap-2 w-[90px]"
        >
          <Plus className="h-4 w-4" />
          <span className="leading-none">Create</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">Loading projects…</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-lg md:text-xl text-gray-500">- No projects yet! -</div>
          </div>
        ) : (
          projects.map((p) => {
            const status = statuses[p.id] ?? 'none';

            const bgClass =
              status === 'done'
                ? 'bg-success/25'
                : status === 'tilde'
                ? 'bg-warning/25'
                : 'bg-base-100';

            const borderClass =
              status === 'done'
                ? 'border-emerald-600'
                : status === 'tilde'
                ? 'border-amber-600'
                : 'border-gray-100';

            const buttonClass =
              status === 'done'
                ? 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-success bg-success/20 text-sm cursor-pointer'
                : status === 'tilde'
                ? 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-warning bg-warning/20 text-sm cursor-pointer'
                : 'h-5 w-5 flex items-center justify-center rounded-md border-2 border-gray-700 text-sm cursor-pointer';

            return (
              <div key={p.id} className="relative cursor-pointer">
                {/* chunky 3D slab shadow/base under the card */}
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-md bg-base-200 border border-gray-200/20 z-0" />

                <div className="relative z-10">
                  <div
                    className={`${bgClass} p-3 pb-6 rounded border ${borderClass} transition-transform duration-150 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-medium">{p.name}</div>

                          <button
                            aria-label="Toggle project status"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              cycleStatus(p.id);
                            }}
                            className={buttonClass}
                            title={
                              status === 'none'
                                ? 'Mark in progress'
                                : status === 'tilde'
                                ? 'Mark done'
                                : 'Clear status'
                            }
                          >
                            {status === 'done' ? (
                              <Check className="h-4 w-4 text-emerald-800" strokeWidth={2} />
                            ) : status === 'tilde' ? (
                              <span className="text-sm font-bold text-amber-800">~</span>
                            ) : null}
                          </button>
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                          {p.description ?? 'No description'}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <button
                          aria-label="Delete project"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            deleteProject(p.id);
                          }}
                          className="text-red-400 hover:text-red-500 p-1 rounded"
                          title="Delete project"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
