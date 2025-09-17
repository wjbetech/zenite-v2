import { NextResponse } from 'next/server';
import prisma from '../../../../src/lib/prisma';
// server-side auth integration (Clerk) deferred for now

export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, ownerId, projectId } = body || {};
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  // prefer session owner id when available
  try {
    // server-side auth integration (Clerk) deferred for now
    const userId = ownerId;

    // Enforce per-user daily task limit when creating daily recurrence tasks
    // If the client requests a daily task and the user already has 10 or more
    // daily tasks, reject the creation with a 400.
    if ((body.recurrence || '').toString() === 'daily' && userId) {
      const existingDaily = await prisma.task.count({
        where: { ownerId: userId, recurrence: 'daily' },
      });
      if (existingDaily >= 10) {
        return NextResponse.json({ error: 'daily task limit reached' }, { status: 400 });
      }
    }

    const task = await prisma.task.create({
      data: { title, description, ownerId: userId || undefined, projectId: projectId || undefined },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    console.warn('session lookup failed, continuing without session', e);
  }
  const task = await prisma.task.create({
    data: { title, description, ownerId: ownerId || undefined, projectId: projectId || undefined },
  });
  return NextResponse.json(task, { status: 201 });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
