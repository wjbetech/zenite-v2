import { NextResponse } from 'next/server';
import prisma from '../../../../src/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(projects);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch projects', details: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body || {};
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

    const project = await prisma.project.create({ data: { name, description } });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create project', details: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update project', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete project', details: String(err) }, { status: 500 });
  }
}
