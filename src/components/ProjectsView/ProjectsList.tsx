'use client';

import React from 'react';
import ProjectCard from './ProjectCard';
import { projectSlug } from '../../lib/utils';
import type { Project } from '../../lib/projectStore';

export default function ProjectsList({
  projects,
  onDelete,
  onEdit,
}: {
  projects: Project[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <>
      {projects.map((p) => {
        const slug = projectSlug(p.name);
        const href = `/projects/${slug}`;
        return (
          <div key={p.id} className="w-full">
            <ProjectCard
              project={p}
              href={href}
              onDelete={() => onDelete(p.id)}
              onEdit={() => onEdit(p.id)}
            />
          </div>
        );
      })}
    </>
  );
}
