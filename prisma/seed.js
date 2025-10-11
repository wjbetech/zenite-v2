/* eslint-disable @typescript-eslint/no-require-imports */
// Safe, idempotent seeding for dev/test only
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeConfirm() {
  const dbUrl = process.env.DATABASE_URL || '';

  // Basic safety: ensure we're pointing at localhost or a docker host and a dev/test DB name
  if (!/localhost|127\.0\.0\.1|::1|postgres/.test(dbUrl)) {
    console.error('\nRefusing to run seeds: DATABASE_URL does not look local.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }

  if (/production|prod|zenite_prod|zenite_production/.test(dbUrl)) {
    console.error('\nRefusing to run seeds: DATABASE_URL looks like production.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }
}

async function main() {
  await safeConfirm();

  const shouldSeedDemo = process.env.SEED_DEMO_DATA === 'true';
  console.log(`Running dev/test seed (demo data ${shouldSeedDemo ? 'enabled' : 'disabled'}).`);
  if (!shouldSeedDemo) {
    console.log(
      'Skipping demo projects and tasks. Set SEED_DEMO_DATA=true if you want sample data inserted.',
    );
    return;
  }

  // Create a default user if not exists
  const user = await prisma.user.upsert({
    where: { email: 'dev@local' },
    update: {},
    create: {
      email: 'dev@local',
      name: 'Local Dev',
    },
  });

  // Create example tags
  const tags = ['inbox', 'bug', 'enhancement', 'chore'];
  for (const t of tags) {
    await prisma.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
  }

  // Create multiple example projects and ensure each has 3-4 tasks (idempotent)
  const projectDefs = [
    { name: 'Getting Started', description: 'A demo project for local development', target: 4 },
    { name: 'Personal', description: 'Personal tasks and routines', target: 3 },
    { name: 'Work', description: 'Work-related tasks and projects', target: 4 },
    { name: 'Backlog', description: 'Ideas and backlog items', target: 3 },
    { name: 'Chores', description: 'Household and maintenance tasks', target: 3 },
  ];

  const createdProjects = [];
  for (const pd of projectDefs) {
    let p = await prisma.project.findFirst({ where: { name: pd.name } });
    if (!p) {
      p = await prisma.project.create({
        data: {
          name: pd.name,
          description: pd.description,
          owner: { connect: { id: user.id } },
        },
      });
    }
    createdProjects.push(p);

    // Ensure the project has the target number of tasks
    const existingCount = await prisma.task.count({ where: { projectId: p.id } });
    const missing = pd.target - existingCount;
    if (missing > 0) {
      const toCreate = [];
      for (let i = 0; i < missing; i++) {
        const idx = existingCount + i + 1;
        toCreate.push({
          title: `${pd.name} — Task ${idx}`,
          description: `Auto-generated task ${idx} for project ${pd.name}`,
          status: 'TODO',
          priority: 'MEDIUM',
          ownerId: user.id,
          projectId: p.id,
        });
      }
      // @ts-expect-error Allow using string enum values in createMany JS call
      await prisma.task.createMany({ data: toCreate });
    }
  }

  // Attach any remaining unassigned tasks to Getting Started as a fallback
  const gs = createdProjects.find((x) => x.name === 'Getting Started');
  if (gs) {
    await prisma.task.updateMany({ where: { projectId: null }, data: { projectId: gs.id } });
  }

  // Create a few unassigned tasks with dueDate values so Today/Week lists display
  const now = new Date();
  const iso = (d) => d.toISOString();
  const sampleDueDates = [
    new Date(now),
    new Date(now.getTime() + 24 * 60 * 60 * 1000),
    new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
  ];
  for (let i = 0; i < sampleDueDates.length; i++) {
    const title = `Due Sample ${i + 1}`;
    const exists = await prisma.task.findFirst({ where: { title } });
    if (exists) {
      await prisma.task.update({ where: { id: exists.id }, data: { dueDate: iso(sampleDueDates[i]) } });
    } else {
      await prisma.task.create({
        data: {
          title,
          description: `Auto-generated due-date sample ${i + 1}`,
          status: 'TODO',
          priority: 'LOW',
          ownerId: user.id,
          projectId: gs ? gs.id : null,
          dueDate: iso(sampleDueDates[i]),
        },
      });
    }
  }

  console.log('Demo data seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
