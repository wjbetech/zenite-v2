import prisma from '../../../lib/prisma';
import ProjectTasksClient from '../../../components/ProjectTasksClient';

export default async function Page(props: unknown) {
  const { params } = props as { params: { slug: string } };
  const { slug } = params;

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
        <div className="text-sm text-red-600 font-semibold mb-2">
          The DB was not found - please contact your network administrator
        </div>
        <h1 className="text-2xl font-semibold mb-4">Project not available</h1>
        <div className="text-sm text-gray-500">Unable to load project data due to a backend error.</div>
      </main>
    );
  }
  
  if (!project) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Project not found</h1>
        <div className="text-sm text-gray-500">No project matched the slug: {slug}</div>
      </main>
    );
  }
  
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{project.name}</h1>
      <p className="text-sm text-gray-500 mb-4">{project.description}</p>
      <ProjectTasksClient projectId={project.id} />
    </main>
  );
}
