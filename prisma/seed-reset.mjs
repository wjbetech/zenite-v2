// Safe reset + dev seed for local development only (ESM).
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function assertLocal() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!/localhost|127\.0\.0\.1|::1|postgres/.test(dbUrl)) {
    console.error('Refusing to run: DATABASE_URL does not look local.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }
  if (/production|prod|zenite_prod|zenite_production/.test(dbUrl)) {
    console.error('Refusing to run: DATABASE_URL looks like production.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run: NODE_ENV=production.');
    process.exit(1);
  }
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export default async function run() {
  assertLocal();

  console.log('Running dev reset seed (destructive): deleting projects & tasks...');

  // delete children first
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});

  // Ensure a dev user exists
  const user = await prisma.user.upsert({
    where: { email: 'dev@local' },
    update: {},
    create: { email: 'dev@local', name: 'Local Dev' },
  });

  const projects = [
    { name: 'Inbox', description: 'Quick capture' },
    { name: 'Website', description: 'Public site work' },
    { name: 'Mobile', description: 'Mobile client' },
    { name: 'Maintenance', description: 'Routine tasks' },
    { name: 'Backlog', description: 'Ideas and future work' },
  ];

  for (let i = 0; i < projects.length; i++) {
    const p = await prisma.project.create({ data: projects[i] });

    const tasks = [
      {
        title: `${p.name} — Critical: Fix bug #${i + 1}`,
        description: 'High priority issue',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: daysFromNow(0),
        ownerId: user.id,
        projectId: p.id,
      },
      {
        title: `${p.name} — Prepare spec`,
        description: 'Write spec and acceptance criteria',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: daysFromNow(2),
        ownerId: user.id,
        projectId: p.id,
      },
      {
        title: `${p.name} — Follow-up`,
        description: 'Follow up next week',
        status: 'TODO',
        priority: 'LOW',
        dueDate: daysFromNow(7),
        ownerId: user.id,
        projectId: p.id,
      },
      {
        title: `${p.name} — Research / spike`,
        description: 'Longer-term research task',
        status: 'TODO',
        priority: 'LOW',
        dueDate: daysFromNow(30),
        ownerId: user.id,
        projectId: p.id,
      },
    ];

    await prisma.task.createMany({ data: tasks });
    console.log(`Created project ${p.name} with ${tasks.length} tasks`);
  }

  console.log('Dev reset + seed complete.');
  await prisma.$disconnect();
}

// If run directly with `node prisma/seed-reset.mjs`, call run()
if (process.argv[1] && process.argv[1].endsWith('seed-reset.mjs')) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
