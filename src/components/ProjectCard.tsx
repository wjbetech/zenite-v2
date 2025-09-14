'use client';

import React from 'react';
import Link from 'next/link';
import { Trash, Folder } from 'lucide-react';

type Props = {
  project: { id: string; name: string; description?: string };
  onDelete?: (id: string) => void;
  href?: string;
};

export default function ProjectCard({ project, onDelete, href }: Props) {
  const cardInner = (
    <div
      className={`bg-base-200 relative z-10 rounded-md shadow-sm border border-info p-4 xl:p-5 min-h-[6rem] transition-all duration-200 transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-md cursor-pointer`}
    >
      <div className="mt-1 flex items-center justify-between h-full">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {/* make folder icon flat (no bg/border) and same visual weight as trash */}
            <Folder className="h-6 w-6 text-info" />
            <div className="text-lg font-medium">{project.name}</div>
          </div>

          {project.description && (
            <div className="text-sm text-gray-500 mt-1">{project.description}</div>
          )}
        </div>

        <div className="flex items-center">
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
    <div className="relative">
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-md bg-base-200 border border-gray-200/20 z-0" />
      {href ? <Link href={href}>{cardInner}</Link> : cardInner}
    </div>
  );
}
