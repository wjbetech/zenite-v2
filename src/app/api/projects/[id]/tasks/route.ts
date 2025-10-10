import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getAuthUserId } from '../../../../../lib/auth-helpers';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const userId = await getAuthUserId();

    // Verify project ownership
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: 'project not found' }, { status: 404 });
    }
    if ((project as any).ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return only tasks for this project that belong to this user
    const tasks = await prisma.task.findMany({
      where: { projectId: id, ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.warn('api/projects/[id]/tasks: failed to fetch tasks for project', id, err);
    return NextResponse.json([], { status: 200 });
  }
}
