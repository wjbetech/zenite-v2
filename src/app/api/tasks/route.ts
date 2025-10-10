import { NextResponse } from 'next/server';
import type { Task as PrismaTask } from '@prisma/client';
import prisma from '../../../../src/lib/prisma';
import { getAuthUserId } from '../../../../src/lib/auth-helpers';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

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



function normalizeNotes(body: Record<string, unknown>) {
  if (typeof body.notes === 'string') return body.notes;
  if (typeof body.description === 'string') return body.description;
  return undefined;
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    const tasks = await prisma.task.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
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
  const notes = normalizeNotes(body);

  try {
    // Always use the authenticated user's ID - ignore any provided ownerId
    const ownerId = await getAuthUserId();

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

  const userId = await getAuthUserId();

  // Verify ownership
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'task not found' }, { status: 404 });
  }
  if (existing.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  let projectIdToAssign: string | null | undefined = undefined;
  // prisma.activity is available after running migrations and generating the client;
  // use the typed prisma client directly.
  const _prisma = prisma;

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
  // Don't allow changing ownerId - tasks are always owned by the creator

  const statusFlags: StatusFlagInput = {};
  let shouldUpdateStatus = false;
  if (body.completed === true || body.completed === false) {
    statusFlags.completed = body.completed;
    shouldUpdateStatus = true;
    if (body.completed === true && body.completedAt === undefined) {
      data.completedAt = new Date();
    }
    if (body.completed === false && body.completedAt === undefined) {
      // Only null out completedAt if the previous completedAt was today; otherwise
      // preserve the previous completedAt so historical activity isn't lost.
      try {
        if (existing && existing.completedAt) {
          const prev = new Date(existing.completedAt);
          const y = prev.getFullYear();
          const m = `${prev.getMonth() + 1}`.padStart(2, '0');
          const d = `${prev.getDate()}`.padStart(2, '0');
          const prevKey = `${y}-${m}-${d}`;
          const now = new Date();
          const ny = now.getFullYear();
          const nm = `${now.getMonth() + 1}`.padStart(2, '0');
          const nd = `${now.getDate()}`.padStart(2, '0');
          const todayKey = `${ny}-${nm}-${nd}`;
          if (prevKey === todayKey) {
            data.completedAt = null;
          } else {
            // preserve previous completedAt by leaving it unset in the update payload
          }
        } else {
          data.completedAt = null;
        }
      } catch {
        // if anything goes wrong, be conservative and null it
        data.completedAt = null;
      }
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
    const updated = await prisma.task.update({ where: { id }, data });

    // Manage activity snapshots: when marking completed -> create activity row for the completion date;
    // when marking uncompleted -> remove today's activity rows for this task only.
    try {
      if (shouldUpdateStatus && 'completed' in statusFlags) {
        const completedFlag = Boolean(statusFlags.completed);
        // Use server's local date for activity bucketing so activity always reflects the
        // day the status change occurred on the server.
        const now = new Date();
        const y = now.getFullYear();
        const m = `${now.getMonth() + 1}`.padStart(2, '0');
        const nd = `${now.getDate()}`.padStart(2, '0');
        const todayKey = `${y}-${m}-${nd}`;

        if (completedFlag) {
          // avoid duplicate for today's bucket
          const exists = await _prisma.activity.findFirst({
            where: { taskId: id, date: todayKey },
          });
          if (!exists) {
            await _prisma.activity.create({
              data: {
                date: todayKey,
                taskId: id,
                taskTitle: updated.title,
                ownerId: updated.ownerId,
              },
            });
          }
        } else {
          // remove only today's activity rows for this task
          await _prisma.activity.deleteMany({ where: { taskId: id, date: todayKey } });
        }
      }
    } catch (err) {
      console.error('PATCH /api/tasks: activity book-keeping failed', err);
    }

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
    const userId = await getAuthUserId();

    // Verify ownership before delete
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'task not found' }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
