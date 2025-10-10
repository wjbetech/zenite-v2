import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const FALLBACK_OWNER_EMAIL = process.env.DEFAULT_TASK_OWNER_EMAIL ?? 'local@zenite.dev';
const FALLBACK_OWNER_NAME = process.env.DEFAULT_TASK_OWNER_NAME ?? 'Zenite Demo User';
import { createProjectSchema, updateProjectSchema } from '../../../lib/validators/projects';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, description } = parsed.data;
    // Determine owner for the new project. We upsert a fallback demo user in
    // cases where an authenticated local user row isn't available (preview/dev).
    const fallback = await prisma.user.upsert({
      where: { email: FALLBACK_OWNER_EMAIL },
      update: {},
      create: { email: FALLBACK_OWNER_EMAIL, name: FALLBACK_OWNER_NAME },
    });
    const project = await prisma.project.create({
      data: {
        name,
        description,
        owner: { connect: { id: fallback.id } },
      },
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
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id, name, description } = parsed.data;
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
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

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
