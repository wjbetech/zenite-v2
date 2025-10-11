export const dynamic = 'force-dynamic';

import ProjectsClient from '../../components/ProjectsClient';
import prisma from '../../lib/prisma';
import { requireAuth } from '../../lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function Page() {
  let projects = [] as Array<{
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date;
  }>;
  try {
    try {
      const authRes = await requireAuth();
      if (authRes.error) {
        // If not authenticated, redirect to login
        redirect('/login');
      }
      const userId = authRes.userId!;
      projects = await prisma.project.findMany({
        where: { ownerId: userId },
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
