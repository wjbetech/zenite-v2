'use client';

import React from 'react';
import useProjectStore from '../lib/projectStore';
import Link from 'next/link';

export default function ProjectSidebar({ className }: { className?: string }) {
  const projects = useProjectStore((s) => s.projects);

  return (
    <aside className={className}>
      <div className="text-sm font-semibold mb-2">Projects</div>
      <div className="flex flex-col gap-2">
        {projects.length === 0 && <div className="text-xs text-gray-500">No projects yet</div>}
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="text-sm hover:underline">
            {p.name}
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/projects" className="text-xs text-gray-500 hover:underline">
          Manage projects
        </Link>
      </div>
    </aside>
  );
}
