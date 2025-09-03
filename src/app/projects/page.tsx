import ProjectsClient from '../../components/ProjectsClient';
import prisma from '../../lib/prisma';

export default async function Page() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });

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
