'use client';

import React from 'react';
import TaskSection from '../TaskSection';
import NativeSortableDaily from '../NativeSortableDaily';
import TaskCard from '../TaskCard';
import type { Task } from '../../lib/taskStore';
import useProjectStore from '../../lib/projectStore';
import useSettingsStore from '../../lib/settingsStore';
import mergeReorderedSubset from '../../lib/task-reorder';
import { daysUntil } from '../../lib/date-utils';

type Item = {
  id: string;
  title: string;
  notes?: string;
  started?: boolean;
  completed?: boolean;
  projectId?: string | null;
};

type Props = {
  tasks: Task[];
  heatmapOpen: boolean;
  storeTasks: Task[];
  setTasks: (tasks: Task[]) => void;
  onEdit: (t: Partial<Task>) => void;
  onDeleteById: (id: string) => void;
  onStatusChange: (id: string, status: 'none' | 'done' | 'tilde') => void;
};

export default function WeekList({
  tasks,
  heatmapOpen,
  storeTasks,
  setTasks,
  onEdit,
  onDeleteById,
  onStatusChange,
}: Props) {
  const projects = useProjectStore((s) => s.projects);
  const density = useSettingsStore((s) => s.density);
  const view: 'full' | 'mini' = density === 'compact' ? 'mini' : 'full';
  if (tasks.length === 0) {
    return (
      <TaskSection
        expanded={!heatmapOpen}
        accentClass="border-indigo-300"
        tasks={tasks}
        noInnerScroll
        renderRight={(t: Task) => {
          const days = daysUntil(t.dueDate);
          const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`;
          return <span className="text-xs text-gray-100">{dueLabel}</span>;
        }}
        onEdit={(t) => onEdit(t)}
        onDelete={(id) => onDeleteById(id)}
        onStatusChange={onStatusChange}
      />
    );
  }

  return (
    <div className="p-0 pt-2">
      <div
        className={`transition-all duration-300 ease-in-out ${
          !heatmapOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <NativeSortableDaily
          items={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            notes: t.notes,
            started: !!t.started,
            completed: !!t.completed,
            projectName: projects.find((p) => p.id === t.projectId)?.name,
          }))}
          onReorder={(next: Item[]) => {
            const idOrder = next.map((n) => n.id);
            const merged = mergeReorderedSubset(storeTasks, idOrder);
            setTasks(merged);
          }}
          renderItem={(t: Item) => (
            <div className="mb-6 px-1.5 sm:px-2" key={t.id}>
              <TaskCard
                task={t as unknown as { id: string } & Partial<Task>}
                view={view}
                onStatusChange={(id: string, status: 'none' | 'done' | 'tilde') =>
                  onStatusChange(id, status)
                }
                onEdit={(task) => onEdit(task)}
                onDelete={(id: string) => onDeleteById(id)}
              />
            </div>
          )}
          containerClassName="space-y-6 md:space-y-7 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-6"
        />
      </div>
    </div>
  );
}
