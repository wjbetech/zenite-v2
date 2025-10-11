import { NextResponse } from 'next/server';
import prisma from '../../../../../src/lib/prisma';
import { updateProjectSchema } from '../../../../lib/validators/projects';
import { getAuthUserId } from '../../../../lib/auth-helpers';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const project = await prisma.project.findUnique({ where: { id }, include: { tasks: true } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Verify ownership
    if (project.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch project', details: String(err) },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthUserId();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Verify ownership
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'project not found' }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    // merge id into body for validation
    const parsed = updateProjectSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, description } = parsed.data;
    const data: Partial<{ name: string; description: string }> = {};
    if (name) data.name = name;
    if (description) data.description = description;

    const updated = await prisma.project.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (err instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to update project', details: err.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to update project', details: String(err) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Verify ownership
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'project not found' }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (err instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to delete project', details: err.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete project', details: String(err) },
      { status: 500 },
    );
  }
}
