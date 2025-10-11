import { NextResponse } from 'next/server';
import prisma from '../../../../src/lib/prisma';
import { createProjectSchema, updateProjectSchema } from '../../../lib/validators/projects';
import { getAuthUserId, requireAuth } from '../../../lib/auth-helpers';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getAuthUserId();
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { _count: { select: { tasks: true } } },
    });

    const serialized = projects.map((p) => {
      const projectWithCount = p as typeof p & { _count?: { tasks?: number } };
      return {
        id: projectWithCount.id,
        name: projectWithCount.name,
        description: projectWithCount.description ?? undefined,
        createdAt: projectWithCount.createdAt.toISOString(),
        taskCount: projectWithCount._count?.tasks ?? 0,
      };
    });

    return NextResponse.json(serialized);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authRes = await requireAuth();
    if (authRes.error) return authRes.error;
    const userId = authRes.userId!;
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, description } = parsed.data;
    const project = await prisma.project.create({
      data: { name, description, ownerId: userId },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create project', details: String(err) },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authRes = await requireAuth();
    if (authRes.error) return authRes.error;
    const userId = authRes.userId!;
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id, name, description } = parsed.data;

    // Verify ownership
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'project not found' }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    const authRes = await requireAuth();
    if (authRes.error) return authRes.error;
    const userId = authRes.userId!;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
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
