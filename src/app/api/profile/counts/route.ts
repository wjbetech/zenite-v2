import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ownerId = url.searchParams.get('ownerId');
    if (!ownerId) return NextResponse.json({ error: 'ownerId required' }, { status: 400 });

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
