'use client';

import React from 'react';
import Link from 'next/link';
import { Trash, Edit } from 'lucide-react';

type Props = {
  project: {
    id: string;
    name: string;
    description?: string;
    taskCount?: number;
    starred?: boolean;
  };
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  href?: string;
};

export default function ProjectCard({ project, onDelete, onEdit, href }: Props) {
  const taskCount = typeof project.taskCount === 'number' ? project.taskCount : 0;
  const cardShadowClasses =
    'shadow-lg shadow-base-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-xl';

  const cardInner = (
    <div
      className={`group/card relative w-full overflow-hidden rounded-2xl border border-base-300/90 bg-base-100/80 backdrop-blur-sm shadow-[0_1px_0_0_rgba(255,255,255,0.4)] ${cardShadowClasses} focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-base-100 focus-within:ring-primary/40`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-emerald-400"
      />
      <div className="relative flex flex-col gap-5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start gap-3">
              <h3 className="flex-1 truncate text-lg font-semibold text-base-content">
                {project.name}
              </h3>
              {project.starred && (
                <span className="badge border border-warning/30 bg-warning/20 text-warning-content px-2 py-1 text-xs font-semibold">
                  Starred
                </span>
              )}
            </div>
            {project.description ? (
              <p className="text-sm text-base-content/70 line-clamp-2">{project.description}</p>
            ) : (
              <p className="text-sm italic text-base-content/40">No description yet</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-base-200/80 pt-4 text-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            <span
              className={`h-2 w-2 rounded-full ${
                taskCount === 0 ? 'bg-warning' : 'bg-emerald-400'
              }`}
              aria-hidden="true"
            />
            {taskCount === 1 ? '1 task' : `${taskCount} tasks`}
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                aria-label="Edit project"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit(project.id);
                }}
                className="btn btn-ghost btn-sm text-success/80 hover:text-success"
                title="Edit project"
              >
                <Edit className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                aria-label="Delete project"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(project.id);
                }}
                className="btn btn-ghost btn-sm text-error/80 hover:text-error"
                title="Delete project"
              >
                <Trash className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none">
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}
