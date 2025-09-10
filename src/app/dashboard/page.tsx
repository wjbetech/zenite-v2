import Dashboard from '../../components/Dashboard';
import prisma from '../../lib/prisma';
import type { Task as PrismaTask } from '@prisma/client';

export default async function Page() {
  // server-side fetch tasks from Prisma and pass to the client Dashboard component
  // If Prisma can't connect (e.g. local Postgres not running), log and continue with an empty list
  let tasks: PrismaTask[] = [];
  try {
    tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  } catch (err) {
    // Don't throw during server render — log and continue with empty tasks.
    console.warn('Prisma client error fetching tasks, continuing with empty list:', err);
    tasks = [];
  }

  const serialized = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    notes: (t.description as string) ?? undefined,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    projectId: t.projectId ?? undefined,
  }));

  return (
    <main className="p-6">
      <Dashboard tasks={serialized} />
    </main>
  );
}
