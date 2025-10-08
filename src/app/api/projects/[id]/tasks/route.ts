import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.warn('api/projects/[id]/tasks: failed to fetch tasks for project', id, err);
    return NextResponse.json([], { status: 200 });
  }
}
