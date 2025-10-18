'use client';

import React from 'react';
import DailyTaskCard from '../../../components/DailyTaskCard';
import useTaskStore, { Task } from '../../../lib/taskStore';

export default function ExperimentalDailies() {
  const tasks = useTaskStore((s) => s.tasks) as Task[];
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const daily = tasks.filter((t) => (t.recurrence ?? 'once') === 'daily');

  const toggle = (id: string) => {
    const t = tasks.find((x) => x.id === id) as Task | undefined;
    if (!t) return;
    if (t.completed) {
      updateTask(id, { completed: false, started: false });
      return;
    }
    if (t.started) {
      updateTask(id, { started: false, completed: true });
      return;
    }
    updateTask(id, { started: true, completed: false });
  };

  return (
    <main className="">
      <h1 className="text-2xl font-semibold mb-4">Experimental Dailies Preview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {daily.length === 0 && (
          <div className="text-sm text-muted-foreground">No daily tasks to preview.</div>
        )}
        {daily.map((t) => (
          <DailyTaskCard
            key={t.id}
            task={{
              id: t.id,
              title: t.title,
              notes: t.notes,
              started: !!t.started,
              completed: !!t.completed,
            }}
            onToggle={toggle}
            onDelete={deleteTask}
          />
        ))}
      </div>
    </main>
  );
}
