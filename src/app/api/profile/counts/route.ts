import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';
import { getAuthUserId } from '../../../../lib/auth-helpers';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Always use authenticated user's ID
    const ownerId = await getAuthUserId();

    // Count tasks owned by the user
    const taskCount = await prisma.task.count({ where: { ownerId } });

    // Count projects owned by the user (once schema is updated)
    // For now, count distinct projectIds among the user's tasks
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
