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

const mockInstructor = {
  id: 'inst-1',
  name: 'Dr. Smith',
  role: 'instructor',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockStudent = {
  id: 'stu-1',
  name: 'Sarah',
  role: 'student',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/readings', () => {
  it('returns readings with creator and annotation count', async () => {
    const mockReadings = [
      {
        id: 'r1',
        title: 'Test Reading',
        description: 'A test',
        createdBy: 'inst-1',
        createdAt: '2024-01-15T00:00:00.000Z',
        creator: mockInstructor,
        _count: { annotations: 3 },
      },
    ];
    vi.mocked(prisma.reading.findMany).mockResolvedValue(mockReadings as any);

    const res = await request(app).get('/api/readings');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockReadings);
    expect(prisma.reading.findMany).toHaveBeenCalledWith({
      include: {
        creator: true,
        _count: { select: { annotations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});

describe('GET /api/readings/:id', () => {
  it('returns reading with annotations', async () => {
    const mockReading = {
      id: 'r1',
      title: 'Test Reading',
      description: 'A test',
      createdBy: 'inst-1',
      createdAt: '2024-01-15T00:00:00.000Z',
      creator: mockInstructor,
      annotations: [
        {
          id: 'a1',
          content: 'Great reading!',
          readingId: 'r1',
          authorId: 'stu-1',
          parentId: null,
          createdAt: '2024-01-16T10:00:00.000Z',
          author: mockStudent,
        },
      ],
    };
    vi.mocked(prisma.reading.findUnique).mockResolvedValue(mockReading as any);

    const res = await request(app).get('/api/readings/r1');

    expect(res.status).toBe(200);
    expect(res.body.annotations).toHaveLength(1);
    expect(res.body.annotations[0].replies).toEqual([]);
    expect(prisma.reading.findUnique).toHaveBeenCalledWith({
      where: { id: 'r1' },
      include: {
        creator: true,
        annotations: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  });

  it('returns 404 for nonexistent reading', async () => {
    vi.mocked(prisma.reading.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/api/readings/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Reading not found' });
  });

  it('builds nested reply tree from flat annotations', async () => {
    const mockReading = {
      id: 'r1',
      title: 'Test',
      description: 'Test',
      createdBy: 'inst-1',
      createdAt: '2024-01-15T00:00:00.000Z',
      creator: mockInstructor,
      annotations: [
        {
          id: 'a1',
          content: 'Top level',
          readingId: 'r1',
          authorId: 'stu-1',
          parentId: null,
          createdAt: '2024-01-16T10:00:00.000Z',
          author: mockStudent,
        },
        {
          id: 'a2',
          content: 'Reply to top',
          readingId: 'r1',
          authorId: 'stu-1',
          parentId: 'a1',
          createdAt: '2024-01-16T11:00:00.000Z',
          author: mockStudent,
        },
        {
          id: 'a3',
          content: 'Reply to reply',
          readingId: 'r1',
          authorId: 'stu-1',
          parentId: 'a2',
          createdAt: '2024-01-16T12:00:00.000Z',
          author: mockStudent,
        },
      ],
    };
    vi.mocked(prisma.reading.findUnique).mockResolvedValue(mockReading as any);

    const res = await request(app).get('/api/readings/r1');

    expect(res.body.annotations).toHaveLength(1);
    expect(res.body.annotations[0].content).toBe('Top level');
    expect(res.body.annotations[0].replies).toHaveLength(1);
    expect(res.body.annotations[0].replies[0].content).toBe('Reply to top');
    expect(res.body.annotations[0].replies[0].replies).toHaveLength(1);
    expect(res.body.annotations[0].replies[0].replies[0].content).toBe('Reply to reply');
  });
});

describe('POST /api/readings', () => {
  it('creates a reading and returns 201', async () => {
    const created = {
      id: 'new-r1',
      title: 'New Reading',
      description: 'Description here',
      createdBy: 'inst-1',
      createdAt: '2024-01-20T00:00:00.000Z',
      creator: mockInstructor,
      _count: { annotations: 0 },
    };
    vi.mocked(prisma.reading.create).mockResolvedValue(created as any);

    const res = await request(app)
      .post('/api/readings')
      .send({ title: 'New Reading', description: 'Description here', createdBy: 'inst-1' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
    expect(prisma.reading.create).toHaveBeenCalledWith({
      data: { title: 'New Reading', description: 'Description here', createdBy: 'inst-1' },
      include: {
        creator: true,
        _count: { select: { annotations: true } },
      },
    });
  });

  it('rejects empty title with 400', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ title: '', description: 'Desc', createdBy: 'inst-1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Title and description are required' });
    expect(prisma.reading.create).not.toHaveBeenCalled();
  });

  it('rejects empty description with 400', async () => {
    const res = await request(app)
      .post('/api/readings')
      .send({ title: 'Title', description: '   ', createdBy: 'inst-1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Title and description are required' });
    expect(prisma.reading.create).not.toHaveBeenCalled();
  });

  it('rejects missing body fields with 400', async () => {
    const res = await request(app).post('/api/readings').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Title and description are required' });
  });

  it('trims whitespace from title and description', async () => {
    vi.mocked(prisma.reading.create).mockResolvedValue({
      id: 'r1',
      title: 'Trimmed',
      description: 'Also trimmed',
    } as any);

    await request(app)
      .post('/api/readings')
      .send({ title: '  Trimmed  ', description: '  Also trimmed  ', createdBy: 'inst-1' });

    expect(prisma.reading.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: 'Trimmed', description: 'Also trimmed', createdBy: 'inst-1' },
      }),
    );
  });
});

describe('GET /api/readings/:id/stats', () => {
  it('returns annotation count and unique students', async () => {
    vi.mocked(prisma.reading.findUnique).mockResolvedValue({
      id: 'r1',
      annotations: [{ authorId: 'stu-1' }, { authorId: 'stu-2' }, { authorId: 'stu-1' }],
      _count: { annotations: 3 },
    } as any);

    const res = await request(app).get('/api/readings/r1/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      readingId: 'r1',
      annotationCount: 3,
      uniqueStudents: 2,
    });
  });

  it('returns 404 for nonexistent reading', async () => {
    vi.mocked(prisma.reading.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/api/readings/nonexistent/stats');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Reading not found' });
  });

  it('returns zero counts for reading with no annotations', async () => {
    vi.mocked(prisma.reading.findUnique).mockResolvedValue({
      id: 'r1',
      annotations: [],
      _count: { annotations: 0 },
    } as any);

    const res = await request(app).get('/api/readings/r1/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      readingId: 'r1',
      annotationCount: 0,
      uniqueStudents: 0,
    });
  });
});
