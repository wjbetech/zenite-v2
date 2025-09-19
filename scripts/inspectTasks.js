/* quick script to inspect tasks dueDate values in the local DB */
(async () => {
  try {
    // dynamic import so this script is compatible with ESM/CJS setups
    const mod = await import('../src/lib/prisma');
    const prisma = (mod && (mod.default || mod)) || mod;

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
      const mod2 = await import('../src/lib/prisma');
      const prisma2 = (mod2 && (mod2.default || mod2)) || mod2;
      if (prisma2 && prisma2.$disconnect) await prisma2.$disconnect();
    } catch {
      // ignore
    }
  }
})();
