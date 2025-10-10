export const dynamic = 'force-dynamic';

import ProjectsClient from '../../components/ProjectsClient';
import prisma from '../../lib/prisma';
import { getAuthUserId } from '../../lib/auth-helpers';

export default async function Page() {
  let projects = [] as Array<{
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
  }>;
  try {
    try {
      const userId = await getAuthUserId();
      projects = await prisma.project.findMany({
        where: { ownerId: userId } as any, // Type will be correct after regenerating Prisma client
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { _count: { select: { tasks: true } } },
      });
    } catch (e) {
      console.log(e);
      // Server-side only: log a concise warning so maintainers can see why the
      // projects page couldn't load. Don't expose DB internals to the client.
      console.warn('Projects page: could not reach database; showing empty list.');
      projects = [];
    }
  } catch (err) {
    // Surface full stack traces in development to help debugging server component errors.
    // Re-throw after logging so Next's error boundary behaves the same.
    if (process.env.NODE_ENV !== 'production') {
      console.error('Projects page: render error', err);
    }
    throw err;
  }

  const serialized = projects.map((p) => {
    const projectWithCount = p as typeof p & { _count?: { tasks?: number } };
    return {
      id: projectWithCount.id,
      name: projectWithCount.name,
      description: projectWithCount.description ?? undefined,
      createdAt: projectWithCount.createdAt.toISOString(),
      taskCount: projectWithCount._count?.tasks ?? 0,
    };
  });

  return (
    <main className="">
      <ProjectsClient initialProjects={serialized} />
    </main>
  );
}
