import { NextResponse } from 'next/server';
import type { Task as PrismaTask } from '@prisma/client';
import prisma from '../../../../src/lib/prisma';

const FALLBACK_OWNER_EMAIL = process.env.DEFAULT_TASK_OWNER_EMAIL ?? 'local@zenite.dev';
const FALLBACK_OWNER_NAME = process.env.DEFAULT_TASK_OWNER_NAME ?? 'Zenite Demo User';

type SerializableTask = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  recurrence?: string | null;
  createdAt: string;
  completed?: boolean;
  completedAt?: string | null;
  started?: boolean;
  projectId?: string | null;
  ownerId?: string;
};

const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

type StatusFlagInput = { started?: boolean; completed?: boolean };

function statusFromFlags({ started, completed }: StatusFlagInput) {
  if (completed) return TASK_STATUS.DONE;
  if (started) return TASK_STATUS.IN_PROGRESS;
  return TASK_STATUS.TODO;
}

function serializeTask(task: PrismaTask): SerializableTask {
  return {
    id: task.id,
    title: task.title,
    notes: task.description ?? undefined,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    recurrence: task.recurrence ?? null,
    createdAt: new Date(task.createdAt).toISOString(),
    completed: task.status === TASK_STATUS.DONE,
    started: task.status === TASK_STATUS.IN_PROGRESS,
    completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null,
    projectId: task.projectId ?? null,
    ownerId: task.ownerId ?? undefined,
  };
}

function parseDate(value: unknown): Date | null | undefined {
  if (value === null) return null;
  if (typeof value === 'string' && value.trim() !== '') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
}

async function resolveOwnerId(provided?: string | null) {
  if (provided) return provided;
  const fallback = await prisma.user.upsert({
    where: { email: FALLBACK_OWNER_EMAIL },
    update: {},
    create: { email: FALLBACK_OWNER_EMAIL, name: FALLBACK_OWNER_NAME },
  });
  return fallback.id;
}

function normalizeNotes(body: Record<string, unknown>) {
  if (typeof body.notes === 'string') return body.notes;
  if (typeof body.description === 'string') return body.description;
  return undefined;
}

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(tasks.map(serializeTask));
  } catch (error) {
    console.error('GET /api/tasks failed', error);
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) ?? {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const recurrence = typeof body.recurrence === 'string' ? body.recurrence : undefined;
  const ownerIdInput = (typeof body.ownerId === 'string' && body.ownerId.trim()) || undefined;
  const notes = normalizeNotes(body);

  try {
    const ownerId = await resolveOwnerId(ownerIdInput);

    if (recurrence === 'daily') {
      const existingDaily = await prisma.task.count({
        where: { ownerId, recurrence: 'daily' },
      });
      if (existingDaily >= 10) {
        return NextResponse.json({ error: 'daily task limit reached' }, { status: 400 });
      }
    }

    const dueDate = parseDate(body.dueDate);
    const completed = body.completed === true;
    const started = body.started === true;
    const completedAtInput = parseDate(body.completedAt);

    const task = await prisma.task.create({
      data: {
        title,
        description: notes,
        ownerId,
        recurrence,
        dueDate: dueDate ?? null,
        status: statusFromFlags({ started, completed }),
        completedAt: completed
          ? completedAtInput ?? new Date()
          : completedAtInput === null
          ? null
          : null,
        projectId: typeof body.projectId === 'string' ? body.projectId : undefined,
      },
    });

    return NextResponse.json(serializeTask(task), { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks failed', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json()) ?? {};
  const id = typeof body.id === 'string' ? body.id : undefined;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const data: Record<string, unknown> = {};
  let projectIdToAssign: string | null | undefined = undefined;

  if (typeof body.title === 'string') data.title = body.title.trim();
  if ('notes' in body || 'description' in body) {
    data.description = normalizeNotes(body) ?? null;
  }
  if ('dueDate' in body) {
    const due = parseDate(body.dueDate);
    data.dueDate = due === undefined ? null : due;
  }
  if (typeof body.recurrence === 'string' || body.recurrence === null) {
    data.recurrence = body.recurrence;
  }
  if ('projectId' in body) {
    if (typeof body.projectId === 'string') {
      const trimmed = body.projectId.trim();
      if (trimmed.length === 0) {
        projectIdToAssign = null;
      } else {
        let project = await prisma.project.findUnique({ where: { id: trimmed } });
        if (!project) {
          project = await prisma.project.findFirst({
            where: {
              name: trimmed,
            },
          });
        }
        if (!project) {
          project = await prisma.project.findFirst({
            where: {
              name: {
                equals: trimmed,
                mode: 'insensitive',
              },
            },
          });
        }
        if (!project) {
          return NextResponse.json({ error: 'project not found' }, { status: 404 });
        }
        projectIdToAssign = project.id;
      }
    } else if (body.projectId === null) {
      projectIdToAssign = null;
    } else if (body.projectId !== undefined) {
      return NextResponse.json({ error: 'invalid projectId' }, { status: 400 });
    }
  }
  if ('ownerId' in body && typeof body.ownerId === 'string') {
    data.ownerId = body.ownerId;
  }

  const statusFlags: StatusFlagInput = {};
  let shouldUpdateStatus = false;
  if (body.completed === true || body.completed === false) {
    statusFlags.completed = body.completed;
    shouldUpdateStatus = true;
    if (body.completed === true && body.completedAt === undefined) {
      data.completedAt = new Date();
    }
    if (body.completed === false && body.completedAt === undefined) {
      data.completedAt = null;
    }
  }
  if (body.started === true || body.started === false) {
    statusFlags.started = body.started;
    shouldUpdateStatus = true;
  }

  if ('completedAt' in body) {
    const completedAt = parseDate(body.completedAt);
    data.completedAt = completedAt === undefined ? null : completedAt;
  }

  if (shouldUpdateStatus) {
    data.status = statusFromFlags(statusFlags);
  }

  if (projectIdToAssign !== undefined) {
    data.projectId = projectIdToAssign;
  }

  try {
    const updated = await prisma.task.update({
      where: { id },
      data,
    });
    return NextResponse.json(serializeTask(updated));
  } catch (error) {
    console.error('PATCH /api/tasks failed', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'task not found' }, { status: 404 });
    }
    console.error('DELETE /api/tasks failed', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
