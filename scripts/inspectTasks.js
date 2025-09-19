/* quick script to inspect tasks dueDate values in the local DB */
const prisma = require('../src/lib/prisma').default || require('../src/lib/prisma');
(async () => {
  try {
    const tasks = await prisma.task.findMany({
      where: { title: { contains: 'Due Sample' } },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Found', tasks.length, 'Due Sample tasks');
    tasks.forEach((t) => {
      console.log(t.title, t.dueDate && t.dueDate.toISOString());
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
