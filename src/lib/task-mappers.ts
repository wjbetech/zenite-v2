import type { Task } from './taskStore';

export function mapTasksToSortableItems(tasks: Task[], projects: { id: string; name: string }[]) {
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.debug(
        '[mapTasksToSortableItems] incoming tasks',
        tasks.map((t) => ({ id: t.id, estimatedDuration: t.estimatedDuration })),
      );
    } catch {}
  }
  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    estimatedDuration: t.estimatedDuration,
    started: !!t.started,
    completed: !!t.completed,
    href: undefined,
    projectName: projects.find((p) => p.id === t.projectId)?.name,
  }));
}
