/* eslint-disable @typescript-eslint/no-require-imports */
// Safe, idempotent seeding for dev/test only
// This script refuses to run if DATABASE_URL points to a non-local host or production-like DB.

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

  console.log('Running dev/test seed...');

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

  // Create example tasks if none exist
  const count = await prisma.task.count();
  if (count === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Welcome to Zenite (local dev)',
          description: 'This is a seeded task. Edit or delete it.',
          status: 'TODO',
          priority: 'MEDIUM',
          ownerId: user.id,
        },
        {
          title: 'Explore Projects',
          description: 'Create projects and assign tasks to them.',
          status: 'TODO',
          priority: 'LOW',
          ownerId: user.id,
        },
      ],
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
