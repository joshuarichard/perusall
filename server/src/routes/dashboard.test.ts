import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../data';

vi.mock('../data', () => ({
  prisma: {
    user: { findMany: vi.fn() },
    reading: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    annotation: { create: vi.fn(), deleteMany: vi.fn() },
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/dashboard', () => {
  it('returns aggregated dashboard data', async () => {
    const mockReadings = [
      {
        id: 'r1',
        title: 'Reading One',
        createdAt: new Date('2024-01-01'),
        annotations: [
          { authorId: 'stu-1', createdAt: new Date('2024-01-02') },
          { authorId: 'stu-2', createdAt: new Date('2024-01-03') },
          { authorId: 'stu-1', createdAt: new Date('2024-01-04') },
        ],
        _count: { annotations: 3 },
      },
      {
        id: 'r2',
        title: 'Reading Two',
        createdAt: new Date('2024-01-05'),
        annotations: [],
        _count: { annotations: 0 },
      },
    ];

    vi.mocked(prisma.reading.findMany).mockResolvedValue(mockReadings as never);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'stu-1', name: 'Alice', role: 'student', createdAt: new Date() },
      { id: 'stu-2', name: 'Bob', role: 'student', createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual({
      totalReadings: 2,
      totalAnnotations: 3,
      uniqueStudents: 2,
    });
    expect(res.body.readings).toHaveLength(2);
    expect(res.body.readings[0]).toMatchObject({
      id: 'r1',
      title: 'Reading One',
      annotationCount: 3,
      uniqueStudents: 2,
    });
    expect(res.body.readings[0].lastActivity).toBeDefined();
    expect(res.body.readings[1].annotationCount).toBe(0);
    expect(res.body.readings[1].lastActivity).toBeNull();
    expect(res.body.students).toHaveLength(2);
    expect(res.body.students[0]).toMatchObject({
      id: 'stu-1',
      name: 'Alice',
      annotationCount: 2,
      readingsParticipated: 1,
    });
  });

  it('returns empty data when no readings exist', async () => {
    vi.mocked(prisma.reading.findMany).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual({
      totalReadings: 0,
      totalAnnotations: 0,
      uniqueStudents: 0,
    });
    expect(res.body.readings).toEqual([]);
    expect(res.body.students).toEqual([]);
  });

  it('counts students across multiple readings correctly', async () => {
    const mockReadings = [
      {
        id: 'r1',
        title: 'Reading One',
        createdAt: new Date('2024-01-01'),
        annotations: [{ authorId: 'stu-1', createdAt: new Date('2024-01-02') }],
        _count: { annotations: 1 },
      },
      {
        id: 'r2',
        title: 'Reading Two',
        createdAt: new Date('2024-01-03'),
        annotations: [{ authorId: 'stu-1', createdAt: new Date('2024-01-04') }],
        _count: { annotations: 1 },
      },
    ];

    vi.mocked(prisma.reading.findMany).mockResolvedValue(mockReadings as never);
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'stu-1', name: 'Alice', role: 'student', createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/dashboard');

    expect(res.body.summary.uniqueStudents).toBe(1);
    expect(res.body.students[0]).toMatchObject({
      annotationCount: 2,
      readingsParticipated: 2,
    });
  });
});
