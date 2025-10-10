import { PrismaClient } from '@prisma/client';

(async () => {
  const p = new PrismaClient();
  try {
    console.log('DATABASE_URL=', process.env.DATABASE_URL ?? '<empty>');
    console.log('Connecting...');
    const c = await p.user.count();
    console.log('User count:', c);
  } catch (e) {
    console.error('ERROR:', e);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
})();
