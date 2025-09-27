import prisma from '../../../lib/prisma';
import ProjectTasksClient from '../../../components/ProjectTasksClient';

export default async function Page(props: unknown) {
  // `params` can be a promise in some Next.js environments — await it before
  // accessing properties to avoid the runtime warning:
  // "params should be awaited before using its properties"
  const { params } = props as { params: { slug: string } | Promise<{ slug: string }> };
  const { slug } = (await params) as { slug: string };

  // naive inverse of slug logic used in ProjectsClient
  const name = slug.replace(/-/g, ' ');

  // Try to find a project by slugified name.
  let project = null;
  try {
    const projects = await prisma.project.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
    project = projects[0] ?? null;
  } catch (err) {
    // If DB is down, show a clear warning instead of demo data so users don't get
    // confused by placeholders that may not reflect real data.
    console.error('Project detail: failed to query database', err);
    return (
      <main className="p-6">
        <div className="px-4 pt-4">
          <div className="text-sm text-red-600 font-semibold mb-2">
            The DB was not found - please contact your network administrator
          </div>
          <h1 className="text-2xl font-semibold mb-4">Project not available</h1>
          <div className="text-sm text-gray-500">
            Unable to load project data due to a backend error.
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
    <main className="p-6">
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
