import type { Task } from './taskStore';

export function mapTasksToSortableItems(tasks: Task[], projects: { id: string; name: string }[]) {
  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    started: !!t.started,
    completed: !!t.completed,
    href: undefined,
    projectName: projects.find((p) => p.id === t.projectId)?.name,
  }));
}
