// Integration-style test for activity POST/GET and interaction with tasks bookkeeping
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
  activity: {
    create: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

import * as activityHandlers from '../route';
import * as taskHandlers from '../../tasks/route';
import prisma from 'src/lib/prisma';

describe('POST/GET /api/activity and tasks bookkeeping integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-01T08:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('posts activity items, reads them back, then task uncomplete removes today rows', async () => {
    // Arrange: mock activity.create to return created rows
    (prisma.activity.create as jest.Mock).mockImplementation(
      async (args: {
        data: { date?: string; taskId?: string; taskTitle?: string; ownerId?: string };
      }) => {
        const d = args.data;
        return {
          id: `a-${d.taskId ?? 'x'}`,
          date: d.date,
          taskId: d.taskId,
          taskTitle: d.taskTitle,
          ownerId: d.ownerId,
        };
      },
    );
    (prisma.activity.findMany as jest.Mock).mockResolvedValue([
      { id: 'a-t1', date: '2025-10-01', taskId: 't1', taskTitle: 'T1', ownerId: 'u1' },
    ]);

    // POST /api/activity
    const postReq = new Request('http://localhost/api/activity', {
      method: 'POST',
      body: JSON.stringify({
        date: '2025-10-01',
        items: [{ taskId: 't1', taskTitle: 'T1', ownerId: 'u1' }],
      }),
    });
    const postRes = await activityHandlers.POST(postReq as unknown as Request);
    const created = await postRes.json();
    expect(prisma.activity.create).toHaveBeenCalled();
    expect(created[0]).toHaveProperty('date', '2025-10-01');

    // GET /api/activity?date=2025-10-01
    const getReq = new Request('http://localhost/api/activity?date=2025-10-01');
    const getRes = await activityHandlers.GET(getReq as unknown as Request);
    const rows = await getRes.json();
    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { date: '2025-10-01' }, orderBy: { createdAt: 'desc' } }),
    );
    expect(rows[0]).toHaveProperty('taskId', 't1');

    // Now simulate PATCH /api/tasks marking task uncompleted; it should call deleteMany for today's date
    const fakeExisting = { id: 't1', completedAt: new Date().toISOString() };
    (prisma.task.findUnique as jest.Mock).mockResolvedValue(fakeExisting);
    (prisma.task.update as jest.Mock).mockResolvedValue({
      id: 't1',
      title: 'T1',
      ownerId: 'u1',
      createdAt: new Date(),
      dueDate: null,
      completedAt: null,
      description: null,
      status: 'TODO',
      projectId: null,
    });

    const patchReq = new Request('http://localhost/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify({ id: 't1', completed: false }),
    });
    const patchRes = await taskHandlers.PATCH(patchReq as unknown as Request);
    const patchBody = await patchRes.json();

    expect(prisma.activity.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { taskId: 't1', date: '2025-10-01' } }),
    );
    expect(patchBody).toHaveProperty('id', 't1');
  });
});
