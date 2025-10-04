// Tests to ensure activity bookkeeping is date-bound and doesn't erase previous days
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status ?? 200,
      ok: true,
    }),
  },
}));

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

import * as handlers from '../route';
import prisma from 'src/lib/prisma';

describe('Date-bound activity bookkeeping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uncompleting a task on a new day only deletes today's activity rows and preserves previous day's activity", async () => {
    // previous day is 2025-10-01, current day is 2025-10-02
    const prevIso = '2025-10-01T12:00:00Z';
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-02T09:00:00Z'));

    // existing task was completed on previous day
    const fakeExisting = { id: 't1', completedAt: prevIso };
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(fakeExisting);
    (prisma.task.update as jest.Mock).mockResolvedValue({
      id: 't1',
      title: 'Task 1',
      ownerId: 'u1',
      createdAt: new Date().toISOString(),
      dueDate: null,
      completedAt: prevIso,
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

    // deleteMany should be called only for today's date (2025-10-02)
    expect(prisma.activity.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { taskId: 't1', date: '2025-10-02' } }),
    );
    // Ensure it did not try to delete the previous day's activity
    expect(prisma.activity.deleteMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { taskId: 't1', date: '2025-10-01' } }),
    );
    // The response should preserve previous completedAt (history preserved)
    expect(body).toHaveProperty('completedAt', new Date(prevIso).toISOString());

    jest.useRealTimers();
  });

  test("completing a task creates today's activity row (not previous day)", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-02T10:00:00Z'));

    (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.task.update as jest.Mock).mockResolvedValue({
      id: 't2',
      title: 'Task 2',
      ownerId: 'u1',
      createdAt: new Date().toISOString(),
      dueDate: null,
      completedAt: new Date().toISOString(),
      description: null,
      status: 'DONE',
      projectId: null,
    });
    (prisma.activity.findFirst as jest.Mock).mockResolvedValue(null);

    const payload = { id: 't2', completed: true };
    const req = new Request('http://localhost/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await handlers.PATCH(req as unknown as Request);

    // create should be called with today's date 2025-10-02
    expect(prisma.activity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ date: '2025-10-02', taskId: 't2' }),
      }),
    );

    jest.useRealTimers();
  });
});
