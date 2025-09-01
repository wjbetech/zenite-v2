'use client';

import React from 'react';
import TaskCard, { Task } from './TaskCard';

type TaskSectionProps = {
  title?: string;
  // full Tailwind border class, e.g. 'border-rose-400'
  accentClass?: string;
  tasks: Task[];
  renderRight?: (t: Task) => React.ReactNode;
};

export default function TaskSection({
  title,
  accentClass = 'border-indigo-300',
  tasks,
  renderRight,
}: TaskSectionProps) {
  return (
    <section className="mb-[74px]">
      {title && (
        <h2 className="text-sm font-medium text-gray-700 mb-6 dark:text-white">
          <span className={`inline-block border-b-4 ${accentClass} pb-0.5`}>{title}</span>
        </h2>
      )}
      <ul className="space-y-6 md:space-y-7 perspective-[1000px]">
        {tasks.length === 0 && <li className="text-sm text-gray-400">No items.</li>}
        {tasks.map((t) => (
          <li key={t.id}>
            <TaskCard
              task={t}
              href={`/tasks/${t.id}`}
              right={renderRight ? renderRight(t) : undefined}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
