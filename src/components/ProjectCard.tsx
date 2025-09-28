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
  const cardInner = (
    <div
      className={`bg-base-200 relative z-10 rounded-md shadow-sm border border-info p-4 xl:p-5 min-h-[6rem] transition-all duration-200 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md cursor-pointer`}
    >
      <div className="mt-1 flex items-center justify-between h-full">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium truncate">{project.name}</div>
            <span className="ml-1 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 shadow-sm">
              {typeof project.taskCount === 'number' ? project.taskCount : 0}
              <span className="sr-only"> tasks</span>
            </span>
          </div>

          {project.description && (
            <div className="text-sm text-gray-500 mt-1">{project.description}</div>
          )}
        </div>

        <div className="flex items-center">
          {onEdit && (
            <button
              aria-label="Edit project"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(project.id);
              }}
              className="text-emerald-600 hover:text-emerald-700 p-3 md:p-2 rounded-md cursor-pointer h-full flex items-center justify-center"
              title="Edit project"
            >
              <Edit className="h-5 w-5" />
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
              className="text-red-400 hover:text-red-500 p-3 md:p-2 rounded-md cursor-pointer h-full flex items-center justify-center"
              title="Delete project"
            >
              <Trash className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-md bg-base-200 border border-gray-200/20 z-0" />
      {href ? (
        <Link href={href}>
          {/* ensure link child fills width */}
          {cardInner}
        </Link>
      ) : (
        cardInner
      )}
    </div>
  );
}
