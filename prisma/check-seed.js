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
    // `e` is `unknown` in modern TS checkers; narrow it safely before reading `.message`
    if (e instanceof Error) {
      console.error('Error querying DB:', e.message);
    } else {
      // Fallback for non-Error throws (strings, objects, etc.)
      console.error('Error querying DB:', String(e));
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
