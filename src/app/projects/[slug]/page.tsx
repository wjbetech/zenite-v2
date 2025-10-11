import prisma from '../../../lib/prisma';
import ProjectTasksClient from '../../../components/ProjectTasksClient';
import { projectSlug } from '../../../lib/utils';
import { requireAuth } from '../../../lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function Page(props: unknown) {
  // `params` can be a promise in some Next.js environments — await it before
  // accessing properties to avoid the runtime warning:
  // "params should be awaited before using its properties"
  const { params } = props as { params: { slug: string } | Promise<{ slug: string }> };
  const { slug } = (await params) as { slug: string };

  // Resolve slug by computing the canonical slug for each project name
  // using the same `projectSlug` helper so hyphens and unicode characters
  // are normalized consistently.
  let project = null;
  try {
    const authRes = await requireAuth();
    if (authRes.error) {
      redirect('/login');
    }
    const userId = authRes.userId!;
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, description: true },
    });
    project = projects.find((p) => projectSlug(p.name ?? '') === slug) ?? null;
  } catch (err) {
    // If DB is down, show a muted hint instead of a red admin alert so the UI
    // matches the other pages' empty-state / error UX.
    console.error('Project detail: failed to query database', err);
    return (
      <main className="">
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-semibold mb-4">Project not available</h1>

          <div className="flex items-center justify-center py-24 w-full">
            <div className="text-center text-base-content/50">
              <p>
                Unable to load tasks — the database may be unavailable. Check your local DB and try
                again, or contact the administrator (wjbetech@gmail.com)
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="p-6">
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-semibold mb-4">Project not found</h1>
          <div className="text-sm text-gray-500">No project matched the slug: {slug}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-semibold mb-4">{project.name}</h1>
        <p className="text-sm text-gray-500 mb-4">{project.description}</p>
      </div>
      <div className="pl-4 pr-4 flex-1 min-h-0 overflow-y-auto overflow-x-visible pb-10">
        <ProjectTasksClient projectId={project.id} />
      </div>
    </main>
  );
}
