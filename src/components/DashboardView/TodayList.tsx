'use client';

import React from 'react';
import TaskSection from '../TaskSection';
import NativeSortableDaily from '../NativeSortableDaily';
import TaskCard from '../TaskCard';
import type { Task } from '../../lib/taskStore';
import useProjectStore from '../../lib/projectStore';
import mergeReorderedSubset from '../../lib/task-reorder';

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

export default function TodayList({
  tasks,
  heatmapOpen,
  storeTasks,
  setTasks,
  onEdit,
  onDeleteById,
  onStatusChange,
}: Props) {
  if (tasks.length === 0) {
    return (
      <TaskSection
        expanded={!heatmapOpen}
        accentClass="border-sky-500"
        tasks={tasks}
        noInnerScroll
        renderRight={() => <span className="text-xs text-gray-100">Due today</span>}
        onEdit={(t) => onEdit(t)}
        onDelete={(id) => onDeleteById(id)}
        onStatusChange={onStatusChange}
      />
    );
  }

  return (
    <div className="pt-2">
      <NativeSortableDaily
        items={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          notes: t.notes,
          started: !!t.started,
          completed: !!t.completed,
        }))}
        onReorder={(next: Item[]) => {
          const idOrder = next.map((n) => n.id);
          const merged = mergeReorderedSubset(storeTasks, idOrder);
          setTasks(merged);
        }}
        renderItem={(t: Item) => (
            <div className="px-1.5 sm:px-2" key={t.id}>
            <TaskCard
              task={t as unknown as { id: string } & Partial<Task>}
              onStatusChange={(id: string, status: 'none' | 'done' | 'tilde') =>
                onStatusChange(id, status)
              }
              onEdit={(task) => onEdit(task)}
              onDelete={(id: string) => onDeleteById(id)}
              right={
                useProjectStore.getState().projects.find((p) => p.id === t.projectId)?.name
              }
            />
          </div>
        )}
        containerClassName="space-y-6 md:space-y-7 xl:space-y-0 xl:grid xl:grid-cols-2 xl:gap-6"
      />
    </div>
  );
}
