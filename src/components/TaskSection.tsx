'use client';

import React from 'react';
import TaskCard, { type Task } from './TaskCard';
import useProjectStore from '../lib/projectStore';
import useSettingsStore from '../lib/settingsStore';

type TaskSectionProps = {
  title?: string;
  // full Tailwind border class, e.g. 'border-rose-400'
  accentClass?: string;
  tasks: Task[];
  renderRight?: (t: Task) => React.ReactNode;
  onEdit?: (t: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
  expanded?: boolean;
  // when true, do not apply internal scrolling; the parent will handle it
  noInnerScroll?: boolean;
};

export default function TaskSection({
  title,
  accentClass = 'border-indigo-300',
  tasks,
  renderRight,
  onEdit,
  onDelete,
  onStatusChange,
  expanded = false,
  noInnerScroll = false,
}: TaskSectionProps) {
  const projects = useProjectStore((s) => s.projects);
  const density = useSettingsStore((s) => s.density);
  const view: 'full' | 'mini' = density === 'compact' ? 'mini' : 'full';

  return (
    <section className="">
      {title && (
        <h2 className="text-sm font-medium text-gray-700 mb-6">
          <span className={`inline-block border-b-4 ${accentClass} pb-0.5`}>{title}</span>
        </h2>
      )}
      <div
        className={`transition-all duration-300 ease-in-out pt-2 pb-4 ${
          expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } ${noInnerScroll ? 'overflow-visible' : 'overflow-hidden'}`}
      >
        <ul className="list-none space-y-6 md:space-y-7 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-6 max-w-full">
          {tasks.length === 0 && null}
          {tasks.map((t) => {
            const projectName = projects.find((p) => p.id === t.projectId)?.name;
            const taskWithProject = {
              ...(t as Record<string, unknown>),
              projectName,
            } as unknown as Task;
            return (
              <li key={t.id} className="px-1.5 sm:px-2">
                <TaskCard
                  task={taskWithProject as unknown as Task}
                  href={`/tasks/${t.id}`}
                  right={renderRight ? renderRight(t) : undefined}
                  view={view}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
