// Mock next/server to avoid depending on Next's Response implementation in tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => {
      return {
        json: async () => body,
        status: init?.status ?? 200,
        ok: true,
      };
    },
  },
}));

// Import handler functions directly after mocks
import * as handlers from '../route';

// Mock prisma client module via path alias
jest.mock('src/lib/prisma', () => ({
  project: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import prisma from 'src/lib/prisma';

describe('API: /api/projects/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET returns project when found', async () => {
    const fakeProject = { id: '00000000-0000-0000-0000-000000000001', name: 'Test', tasks: [] };
    prisma.project.findUnique.mockResolvedValue(fakeProject);

    const req = new Request('http://localhost/api/projects/00000000-0000-0000-0000-000000000001');
    const res = await handlers.GET(req as unknown as Request);
    const json = await res.json();

    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      include: { tasks: true },
    });
    expect(json).toEqual(fakeProject);
  });

  test('GET returns 404 when not found', async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    const req = new Request('http://localhost/api/projects/00000000-0000-0000-0000-000000000002');
    const res = await handlers.GET(req as unknown as Request);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'Project not found');
  });

  test('PATCH updates project', async () => {
    const updated = { id: '00000000-0000-0000-0000-000000000001', name: 'Updated' };
    prisma.project.update.mockResolvedValue(updated);

    const req = new Request('http://localhost/api/projects/00000000-0000-0000-0000-000000000001', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'content-type': 'application/json' },
    });
    const res = await handlers.PATCH(req as unknown as Request);
    const body = await res.json();
    expect(prisma.project.update).toHaveBeenCalled();
    expect(body).toEqual(updated);
  });

  test('DELETE removes project', async () => {
    prisma.project.delete.mockResolvedValue({});
    const req = new Request('http://localhost/api/projects/00000000-0000-0000-0000-000000000001', {
      method: 'DELETE',
    });
    const res = await handlers.DELETE(req as unknown as Request);
    const body = await res.json();
    expect(prisma.project.delete).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
    });
    expect(body).toEqual({ ok: true });
  });
});
