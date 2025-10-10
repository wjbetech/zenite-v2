/**
 * Data migration script: Assign all existing projects to the demo user
 * Run this after adding ownerId to Project model
 */

require('dotenv').config({ path: '.env.production.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FALLBACK_OWNER_EMAIL = process.env.DEFAULT_TASK_OWNER_EMAIL ?? 'local@zenite.dev';
const FALLBACK_OWNER_NAME = process.env.DEFAULT_TASK_OWNER_NAME ?? 'Zenite Demo User';

async function main() {
  console.log('Starting data migration...');

  // Get or create the demo user
  const demoUser = await prisma.user.upsert({
    where: { email: FALLBACK_OWNER_EMAIL },
    update: {},
    create: { email: FALLBACK_OWNER_EMAIL, name: FALLBACK_OWNER_NAME },
  });

  console.log(`Demo user: ${demoUser.email} (${demoUser.id})`);

  // Count orphaned projects (projects without ownerId)
  const orphanedProjects = await prisma.project.count({
    where: {
      OR: [{ ownerId: null }, { ownerId: '' }],
    },
  });

  if (orphanedProjects > 0) {
    console.log(`Found ${orphanedProjects} projects without owner`);

    // Assign all orphaned projects to demo user
    const result = await prisma.project.updateMany({
      where: {
        OR: [{ ownerId: null }, { ownerId: '' }],
      },
      data: {
        ownerId: demoUser.id,
      },
    });

    console.log(`✅ Updated ${result.count} projects with demo user as owner`);
  } else {
    console.log('No orphaned projects found - all projects have owners');
  }

  // Verify counts
  const totalProjects = await prisma.project.count();
  const demoUserProjects = await prisma.project.count({
    where: { ownerId: demoUser.id },
  });

  console.log(`\nFinal counts:`);
  console.log(`  Total projects: ${totalProjects}`);
  console.log(`  Demo user projects: ${demoUserProjects}`);

  console.log('\n✅ Migration complete!');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
