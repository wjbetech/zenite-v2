/* eslint-disable @typescript-eslint/no-require-imports */
// Print a sample of tasks grouped by project for quick verification
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({ orderBy: { name: 'asc' } });
  for (const p of projects) {
    const tasks = await prisma.task.findMany({
      where: { projectId: p.id },
      take: 3,
      orderBy: { createdAt: 'asc' },
    });
    console.log(`Project: ${p.name} (${tasks.length} tasks) - id=${p.id}`);
    for (const t of tasks) {
      console.log(`  - ${t.title} [${t.status}] (id=${t.id})`);
    }
  }

  // Also list any unassigned tasks
  const un = await prisma.task.findMany({ where: { projectId: null }, take: 5 });
  console.log(`\nUnassigned tasks: ${un.length}`);
  for (const t of un) console.log(`  - ${t.title} (id=${t.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
