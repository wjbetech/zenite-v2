'use client';

import React from 'react';
import useProjectStore from '../../lib/projectStore';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default function ProjectSidebar({ className }: { className?: string }) {
  const projects = useProjectStore((s) => s.projects);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [open, setOpen] = React.useState<boolean>(true);

  const toggleStar = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    updateProject(id, { starred: !p.starred });
  };

  return (
    <aside className={className}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Projects</div>
        <button
          aria-expanded={open}
          aria-controls="project-list"
          onClick={() => setOpen((s) => !s)}
          className="btn btn-ghost btn-sm btn-square"
          title={open ? 'Collapse projects' : 'Expand projects'}
        >
          {open ? <span className="text-xs">−</span> : <span className="text-xs">+</span>}
        </button>
      </div>

      <div
        id="project-list"
        role="region"
        aria-label="Projects"
        className={`mt-2 transition-all duration-150 ${
          open ? 'max-h-96' : 'max-h-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col gap-1 overflow-auto" style={{ maxHeight: '24rem' }}>
          {projects.length === 0 && <div className="text-xs text-gray-500">No projects yet</div>}
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2 px-1 py-1">
              <Link href={`/projects/${p.id}`} className="text-sm truncate hover:underline">
                {p.name}
              </Link>
              <button
                aria-pressed={!!p.starred}
                onClick={() => toggleStar(p.id)}
                className={`btn btn-ghost btn-xs btn-square ${p.starred ? 'text-yellow-400' : ''}`}
                title={p.starred ? 'Unstar project' : 'Star project'}
              >
                {/* lucide-react Star icon isn't exported as StarIcon in the project, use Star */}
                <Star className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <Link href="/projects" className="text-xs text-gray-500 hover:underline">
          Manage projects
        </Link>
      </div>
    </aside>
  );
}
