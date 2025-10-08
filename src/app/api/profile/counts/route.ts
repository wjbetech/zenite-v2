import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let ownerId = url.searchParams.get('ownerId');
    const ownerEmail = url.searchParams.get('ownerEmail');

    // If ownerId not supplied but ownerEmail is, try to resolve the user id from DB
    if (!ownerId && ownerEmail) {
      const user = await prisma.user.findUnique({ where: { email: ownerEmail } });
      if (user) ownerId = user.id;
    }

    // If we still don't have an owner, return overall counts (useful for dev/debug)
    if (!ownerId) {
      const taskCount = await prisma.task.count();
      // Count distinct projectIds across all tasks (excluding null)
      const projects = await prisma.task.findMany({
        select: { projectId: true },
        where: { projectId: { not: null } },
      });
      const uniqueProjectIds = new Set(projects.map((p) => p.projectId));
      const projectCount = uniqueProjectIds.size;
      return NextResponse.json({ taskCount, projectCount });
    }

    // Count tasks owned by the user
    const taskCount = await prisma.task.count({ where: { ownerId } });

    // Count distinct projectIds among the user's tasks (excluding null)
    const projects = await prisma.task.findMany({
      where: { ownerId, projectId: { not: null } },
      select: { projectId: true },
    });
    const uniqueProjectIds = new Set(projects.map((p) => p.projectId));
    const projectCount = uniqueProjectIds.size;

    return NextResponse.json({ taskCount, projectCount });
  } catch (err) {
    return NextResponse.json({ error: 'failed', details: String(err) }, { status: 500 });
  }
}
