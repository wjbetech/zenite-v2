// Mock NextResponse implementation for tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; [key: string]: unknown }) => ({
      json: async () => body,
      status: init?.status ?? 200,
      ok: true,
    }),
  },
}));

import * as handlers from '../route';

jest.mock('src/lib/prisma', () => ({
  task: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  user: {
    upsert: jest.fn(),
  },
}));

import prisma from 'src/lib/prisma';

describe('/api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'fallback-user' });
  });

  test('GET returns tasks', async () => {
    const fake = [
      {
        id: '1',
        title: 't1',
        description: 'note',
        dueDate: null,
        recurrence: null,
        createdAt: new Date('2025-09-26T00:00:00.000Z'),
        status: 'TODO',
        completedAt: null,
        projectId: null,
        ownerId: 'u1',
        updatedAt: new Date('2025-09-26T00:00:00.000Z'),
      },
    ];
    (prisma.task.findMany as jest.Mock).mockResolvedValue(fake);
    const res = await handlers.GET();
    const body = await res.json();
    expect(body).toEqual([
      {
        id: '1',
        title: 't1',
        notes: 'note',
        dueDate: null,
        recurrence: null,
        createdAt: '2025-09-26T00:00:00.000Z',
        completed: false,
        started: false,
        completedAt: null,
        projectId: null,
        ownerId: 'u1',
      },
    ]);
  });

  test('POST rejects when title missing', async () => {
    const req = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await handlers.POST(req as unknown as Request);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'title required');
  });

  test('POST enforces daily limit', async () => {
    (prisma.task.count as jest.Mock).mockResolvedValue(10);
    (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'u1' });
    const payload = { title: 'daily', recurrence: 'daily' };
    const req = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await handlers.POST(req as unknown as Request);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'daily task limit reached');
  });

  test('POST creates task when under limit', async () => {
    const created = {
      id: 't-new',
      title: 'ok',
      description: null,
      createdAt: new Date('2025-09-26T01:00:00.000Z'),
      recurrence: null,
      status: 'TODO',
      completedAt: null,
      projectId: null,
      ownerId: 'u1',
      dueDate: null,
      updatedAt: new Date('2025-09-26T01:00:00.000Z'),
    };
    (prisma.task.count as jest.Mock).mockResolvedValue(3);
    (prisma.task.create as jest.Mock).mockResolvedValue(created);

    const payload = { title: 'ok', recurrence: 'daily' };
    const req = new Request('http://localhost/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await handlers.POST(req as unknown as Request);
    const body = await res.json();
    expect(prisma.task.create).toHaveBeenCalled();
    expect(body).toEqual({
      id: 't-new',
      title: 'ok',
      notes: undefined,
      dueDate: null,
      recurrence: null,
      createdAt: '2025-09-26T01:00:00.000Z',
      completed: false,
      started: false,
      completedAt: null,
      projectId: null,
      ownerId: 'u1',
    });
  });
});
