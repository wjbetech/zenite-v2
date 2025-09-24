import ProjectsClient from '../../components/ProjectsClient';
import prisma from '../../lib/prisma';

export default async function Page() {
  let projects = [] as Array<{ id: string; name: string; description?: string | null; createdAt: Date }>;

  try {
    projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  } catch {
    // Server-side only: log a concise warning so maintainers can see why the
    // projects page couldn't load. Don't expose DB internals to the client.
    console.warn('Projects page: could not reach database; showing empty list.');
    projects = [];
  }

  const serialized = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main className="p-6">
      <ProjectsClient initialProjects={serialized} />
    </main>
  );
}
