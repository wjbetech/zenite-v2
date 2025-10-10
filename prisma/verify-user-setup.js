/**
 * Verify user setup and data access control
 */

require('dotenv').config({ path: '.env.production.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEFAULT_TASK_OWNER_EMAIL ?? 'local@zenite.dev';
const DEMO_NAME = process.env.DEFAULT_TASK_OWNER_NAME ?? 'Zenite Demo User';

async function main() {
  console.log('🔍 Verifying user setup...\n');

  // Get or create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: DEMO_NAME },
  });

  console.log(`✅ Demo user: ${demoUser.email}`);
  console.log(`   ID: ${demoUser.id}\n`);

  // Check data counts
  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();

  console.log('📊 Database counts:');
  console.log(`   Users: ${userCount}`);
  console.log(`   Projects: ${projectCount}`);
  console.log(`   Tasks: ${taskCount}\n`);

  // Check if all projects have owners
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, ownerId: true },
      take: 5,
    });

    if (projects.length > 0) {
      console.log('📁 Sample projects (showing up to 5):');
      projects.forEach((p) => {
        const ownerStatus = p.ownerId ? `✅ Owner: ${p.ownerId}` : '❌ NO OWNER';
        console.log(`   ${p.name}: ${ownerStatus}`);
      });
    } else {
      console.log('📁 No projects in database');
    }
  } catch (err) {
    console.error('❌ Error checking projects:', err.message);
  }

  console.log('\n✅ Verification complete!');
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
