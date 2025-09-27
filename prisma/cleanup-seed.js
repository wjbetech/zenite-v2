/* eslint-disable @typescript-eslint/no-require-imports */
// Safe cleanup script to remove demo projects and their tasks from local/dev DB.
// This script performs basic checks to avoid running against production-like DATABASE_URL.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeConfirm() {
  const dbUrl = process.env.DATABASE_URL || '';

  if (!/localhost|127\.0\.0\.1|::1|postgres/.test(dbUrl)) {
    console.error('\nRefusing to run cleanup: DATABASE_URL does not look local.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }

  if (/production|prod|zenite_prod|zenite_production/.test(dbUrl)) {
    console.error('\nRefusing to run cleanup: DATABASE_URL looks like production.');
    console.error('DATABASE_URL=', dbUrl);
    process.exit(1);
  }
}

async function main() {
  await safeConfirm();

  const demoNames = ['Getting Started', 'Personal', 'Work', 'Backlog', 'Chores'];

  console.log('Running cleanup of demo projects and their tasks...');

  for (const name of demoNames) {
    const project = await prisma.project.findFirst({ where: { name } });
    if (!project) {
      console.log(`Project not found: ${name} — skipping`);
      continue;
    }

    // Delete tasks belonging to this project
    const deletedTasks = await prisma.task.deleteMany({ where: { projectId: project.id } });
    console.log(`Deleted ${deletedTasks.count} tasks for project: ${name}`);

    // Delete the project itself
    await prisma.project.delete({ where: { id: project.id } });
    console.log(`Deleted project: ${name}`);
  }

  console.log('Cleanup complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
