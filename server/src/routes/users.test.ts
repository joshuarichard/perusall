import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../data';

vi.mock('../data', () => ({
  prisma: {
    user: { findMany: vi.fn() },
    reading: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    annotation: { create: vi.fn() },
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/users', () => {
  it('returns all users sorted by name', async () => {
    const mockUsers = [
      {
        id: 'inst-1',
        name: 'Dr. Smith',
        role: 'instructor',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      { id: 'stu-1', name: 'Sarah', role: 'student', createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUsers);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });
});
