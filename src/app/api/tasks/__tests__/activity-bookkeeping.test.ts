// Ensure activity bookkeeping creates today's activity when completing and deletes today's when uncompleting
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
      ok: true,
    }),
  },
}));

import * as handlers from '../route';

jest.mock('src/lib/prisma', () => ({
  task: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  activity: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

import prisma from 'src/lib/prisma';

describe('PATCH /api/tasks activity bookkeeping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Freeze time to a deterministic value (server local date isn't relevant in tests; use UTC)
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-01T12:34:56Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('creates an activity row for today when marking completed', async () => {
    const fakeExisting = { id: 't1', completedAt: null };
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(fakeExisting);
    (prisma.task.update as jest.Mock).mockResolvedValue({
      id: 't1',
      title: 'Task 1',
      ownerId: 'u1',
      createdAt: new Date(),
      dueDate: null,
      completedAt: null,
      description: null,
      status: 'DONE',
      projectId: null,
    });
    (prisma.activity.findFirst as jest.Mock).mockResolvedValue(null);

    const payload = { id: 't1', completed: true };
    const req = new Request('http://localhost/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const res = await handlers.PATCH(req as unknown as Request);
    const body = await res.json();

    expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: 't1' } });
    // create should be called once for today's bucket
    expect(prisma.activity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { taskId: 't1', date: '2025-10-01' } }),
    );
    expect(prisma.activity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ taskId: 't1', date: '2025-10-01' }),
      }),
    );
    expect(body).toHaveProperty('id', 't1');
  });

  test("deletes today's activity rows when marking uncompleted", async () => {
    const prevDate = new Date().toISOString();
    const fakeExisting = { id: 't1', completedAt: prevDate };
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(fakeExisting);
    (prisma.task.update as jest.Mock).mockResolvedValue({
      id: 't1',
      title: 'Task 1',
      ownerId: 'u1',
      createdAt: new Date(),
      dueDate: null,
      completedAt: prevDate,
      description: null,
      status: 'TODO',
      projectId: null,
    });

    const payload = { id: 't1', completed: false };
    const req = new Request('http://localhost/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const res = await handlers.PATCH(req as unknown as Request);
    const body = await res.json();

    expect(prisma.activity.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { taskId: 't1', date: '2025-10-01' } }),
    );
    expect(body).toHaveProperty('id', 't1');
  });
});
