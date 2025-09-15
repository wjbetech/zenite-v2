import { NextResponse } from 'next/server';
import prisma from '../../../../src/lib/prisma';

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description } = body || {};
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const project = await prisma.project.create({ data: { name, description } });
  return NextResponse.json(project, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, name, description } = body || {};
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!name && !description)
    return NextResponse.json({ error: 'no update fields provided' }, { status: 400 });

  const data: Partial<{ name: string; description: string }> = {};
  if (name) data.name = name;
  if (description) data.description = description;

  const updated = await prisma.project.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
