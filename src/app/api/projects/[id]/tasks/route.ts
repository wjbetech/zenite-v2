import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

type RouteContext = { params: { id: string } };

export async function GET(request: Request, context: unknown) {
  const { params } = context as RouteContext;
  const { id } = params;
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
