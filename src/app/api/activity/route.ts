import { NextResponse } from 'next/server';
import prismaClient from '../../../../src/lib/prisma';

// Prevent static generation - this route must run at request time
export const dynamic = 'force-dynamic';

// Prisma client will have the `activity` model once the schema is migrated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = prismaClient as any;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') ?? undefined;
    const where: Record<string, unknown> = {};
    if (date) where.date = date;
    const rows = await prisma.activity.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/activity failed', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) ?? {};
    const date = typeof body.date === 'string' ? body.date : null;
    const items = Array.isArray(body.items) ? body.items : [];
    if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

    const created = await Promise.all(
      items.map((it: Record<string, unknown>) =>
        prisma.activity.create({
          data: {
            date,
            taskId: typeof it.taskId === 'string' ? it.taskId : undefined,
            taskTitle: typeof it.taskTitle === 'string' ? it.taskTitle : it['title'] ?? 'Untitled',
            ownerId: typeof it.ownerId === 'string' ? it.ownerId : undefined,
          },
        }),
      ),
    );
    return NextResponse.json(created);
  } catch (err) {
    console.error('POST /api/activity failed', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
