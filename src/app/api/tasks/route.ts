import { NextResponse } from 'next/server';
import type { Task as PrismaTask } from '@prisma/client';
import prisma from '../../../../src/lib/prisma';
import { requireAuth } from '../../../../src/lib/auth-helpers';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

type SerializableTask = {
  id: string;
  title: string;
  notes?: string;
  estimatedDuration?: number;
  dueDate?: string | null;
  dueTime?: string | null;
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
    estimatedDuration:
      typeof task.estimatedDuration === 'number' ? task.estimatedDuration : undefined,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    dueTime: task.dueTime ? new Date(task.dueTime).toISOString() : null,
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
    const authRes = await requireAuth();
    if (authRes.error) return authRes.error;
    const userId = authRes.userId!;
    console.log('[GET /api/tasks] Fetching tasks for userId:', userId);
    const tasks = await prisma.task.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    console.log('[GET /api/tasks] Found', tasks.length, 'tasks for userId:', userId);
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
    // Require a real authenticated user for mutating operations
    const authRes = await requireAuth();
    if (authRes.error) return authRes.error;
    const ownerId = authRes.userId!;

    if (recurrence === 'daily') {
      const existingDaily = await prisma.task.count({
        where: { ownerId, recurrence: 'daily' },
      });
      if (existingDaily >= 10) {
        return NextResponse.json({ error: 'daily task limit reached' }, { status: 400 });
      }
    }

  const dueDate = parseDate(body.dueDate);
  const dueTimeInput = parseDate(body.dueTime);
    const completed = body.completed === true;
    const started = body.started === true;
    const completedAtInput = parseDate(body.completedAt);

    const task = await prisma.task.create({
      data: {
        title,
        description: notes,
        ownerId,
        estimatedDuration: Number.isFinite(Number(body.estimatedDuration))
          ? Number(body.estimatedDuration)
          : undefined,
        recurrence,
        dueDate: dueDate ?? null,
        // dueTime: prefer explicit dueTime; otherwise default to midnight of the dueDate
        dueTime:
          dueTimeInput !== undefined
            ? dueTimeInput ?? null
            : dueDate
            ? new Date(
                dueDate.getFullYear(),
                dueDate.getMonth(),
                dueDate.getDate(),
                0,
                0,
                0,
                0
              )
            : null,
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

  const authRes = await requireAuth();
  if (authRes.error) return authRes.error;
  const userId = authRes.userId!;

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
    // If dueDate was included in the patch and dueTime wasn't explicitly provided,
    // default dueTime to midnight of the provided dueDate (or null if dueDate is null)
    if ('dueTime' in body) {
      const dt = parseDate(body.dueTime);
      data.dueTime = dt === undefined ? null : dt;
    } else {
      // If parseDate returned undefined (invalid), store null. If it returned null (explicit clear), store null.
      if (due === undefined || due === null) {
        data.dueTime = null;
      } else {
        data.dueTime = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 0, 0, 0, 0);
      }
    }
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

  if ('estimatedDuration' in body) {
    // allow null to explicitly clear the duration
    if (body.estimatedDuration === null) {
      data.estimatedDuration = null;
    } else if (Number.isFinite(Number(body.estimatedDuration))) {
      data.estimatedDuration = Number(body.estimatedDuration);
    } else {
      // ignore invalid values
    }
  }

  if (shouldUpdateStatus) {
    data.status = statusFromFlags(statusFlags);
  }

  // allow updating dueTime directly when dueDate isn't part of the patch
  if (!('dueDate' in body) && 'dueTime' in body) {
    const dt = parseDate(body.dueTime);
    data.dueTime = dt === undefined ? null : dt;
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
    const authRes = await requireAuth();
    if (authRes.error) return authRes.error;
    const userId = authRes.userId!;

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
