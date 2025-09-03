import Dashboard from '../../components/Dashboard';
import prisma from '../../lib/prisma';

export default async function Page() {
  // server-side fetch tasks from Prisma and pass to the client Dashboard component
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });

  const serialized = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    notes: t.description ?? undefined,
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
