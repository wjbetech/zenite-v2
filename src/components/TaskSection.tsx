'use client';

import React from 'react';
import TaskCard, { Task } from './TaskCard';

type TaskSectionProps = {
  title?: string;
  // full Tailwind border class, e.g. 'border-rose-400'
  accentClass?: string;
  tasks: Task[];
  renderRight?: (t: Task) => React.ReactNode;
  onEdit?: (t: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: 'none' | 'done' | 'tilde') => void;
  expanded?: boolean;
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
}: TaskSectionProps) {
  return (
    <section className="mb-[74px]">
      {title && (
        <h2 className="text-sm font-medium text-gray-700 mb-6">
          <span className={`inline-block border-b-4 ${accentClass} pb-0.5`}>{title}</span>
        </h2>
      )}
      <div
        className={`overflow-y-auto transition-all duration-300 ease-in-out pt-4 pl-4 pr-4 pb-2`}
        style={{ maxHeight: expanded ? 'calc(100vh - 10rem)' : undefined }}
      >
        <ul className="space-y-6 md:space-y-7 perspective-[1000px]">
          {tasks.length === 0 && <li className="text-sm text-gray-400">No items.</li>}
          {tasks.map((t) => (
            <li key={t.id}>
              <TaskCard
                task={t}
                href={`/tasks/${t.id}`}
                right={renderRight ? renderRight(t) : undefined}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
