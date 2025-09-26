import prisma from '../../../lib/prisma';
import ProjectTasksClient from '../../../components/ProjectTasksClient';

export default async function Page(props: unknown) {
  const { params } = props as { params: { slug: string } };
  const { slug } = params;

  // naive inverse of slug logic used in ProjectsClient
  const name = slug.replace(/-/g, ' ');

  // Try to find a project by slugified name; fallback to demo data if DB is unreachable
  let project = null;
  try {
    const projects = await prisma.project.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
    project = projects[0] ?? null;
  } catch (err) {
    // Likely the database is down (e.g., in dev). Fall back to demo projects so the
    // route can still render and the user can inspect the UI.
    console.warn('Project detail: failed to query database, falling back to demo projects', err);

    const demoProjects = [
      {
        id: 'demo-getting-started',
        name: 'Getting Started',
        description: 'A demo project for local development',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-personal',
        name: 'Personal',
        description: 'Personal tasks and routines',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-work',
        name: 'Work',
        description: 'Work-related tasks and projects',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-backlog',
        name: 'Backlog',
        description: 'Ideas and backlog items',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'demo-chores',
        name: 'Chores',
        description: 'Household and maintenance tasks',
        createdAt: new Date().toISOString(),
      },
    ];

    // match demo project by slugified name
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

    project = demoProjects.find((p) => slugify(p.name) === slug) ?? null;
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
