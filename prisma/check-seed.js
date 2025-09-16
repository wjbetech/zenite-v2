import { PrismaClient } from '@prisma/client';
(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.count();
    const tasks = await prisma.task.count();
    const projects = await prisma.project.count();
    console.log('Users:', users);
    console.log('Tasks:', tasks);
    console.log('Projects:', projects);
  } catch (e) {
    console.error('Error querying DB:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
