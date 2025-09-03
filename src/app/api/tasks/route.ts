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
