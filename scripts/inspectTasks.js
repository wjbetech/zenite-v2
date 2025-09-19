/* quick script to inspect tasks dueDate values in the local DB */
(async () => {
  try {
    // import Prisma client directly to avoid importing project TS helper
    const prismaMod = await import('@prisma/client');
    const PrismaClient = prismaMod.PrismaClient || prismaMod.default;
    const prisma = new PrismaClient();

    const tasks = await prisma.task.findMany({
      where: { title: { contains: 'Due Sample' } },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Found', tasks.length, 'Due Sample tasks');
    tasks.forEach((t) => {
      console.log(t.title, t.dueDate && t.dueDate.toISOString());
    });
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    // attempt graceful disconnect if prisma module was imported
    try {
      const prismaMod2 = await import('@prisma/client');
      const PrismaClient2 = prismaMod2.PrismaClient || prismaMod2.default;
      const prisma2 = new PrismaClient2();
      if (prisma2 && prisma2.$disconnect) await prisma2.$disconnect();
    } catch {
      // ignore
    }
  }
})();
