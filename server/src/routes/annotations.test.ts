import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../data';
import { Errors } from '../types';

vi.mock('../data', () => ({
  prisma: {
    user: { findMany: vi.fn() },
    reading: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    annotation: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

const mockStudent = {
  id: 'stu-1',
  name: 'Sarah',
  role: 'student',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST /api/annotations', () => {
  it('creates an annotation and returns 201', async () => {
    const created = {
      id: 'a1',
      content: 'Insightful comment',
      readingId: 'r1',
      authorId: 'stu-1',
      createdAt: '2024-01-20T00:00:00.000Z',
      author: mockStudent,
    };
    vi.mocked(prisma.annotation.create).mockResolvedValue(created as any);

    const res = await request(app)
      .post('/api/annotations')
      .send({ content: 'Insightful comment', readingId: 'r1', authorId: 'stu-1' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
    expect(prisma.annotation.create).toHaveBeenCalledWith({
      data: { content: 'Insightful comment', readingId: 'r1', authorId: 'stu-1' },
      include: { author: true },
    });
  });

  it('rejects empty content with 400', async () => {
    const res = await request(app)
      .post('/api/annotations')
      .send({ content: '', readingId: 'r1', authorId: 'stu-1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: Errors.ANNOTATION_EMPTY });
    expect(prisma.annotation.create).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only content with 400', async () => {
    const res = await request(app)
      .post('/api/annotations')
      .send({ content: '   ', readingId: 'r1', authorId: 'stu-1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: Errors.ANNOTATION_EMPTY });
  });

  it('rejects missing readingId with 400', async () => {
    const res = await request(app)
      .post('/api/annotations')
      .send({ content: 'Hello', authorId: 'stu-1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: Errors.READING_AND_AUTHOR_REQUIRED });
  });

  it('rejects missing authorId with 400', async () => {
    const res = await request(app)
      .post('/api/annotations')
      .send({ content: 'Hello', readingId: 'r1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: Errors.READING_AND_AUTHOR_REQUIRED });
  });

  it('trims whitespace from content', async () => {
    vi.mocked(prisma.annotation.create).mockResolvedValue({
      id: 'a1',
      content: 'Trimmed',
    } as any);

    await request(app)
      .post('/api/annotations')
      .send({ content: '  Trimmed  ', readingId: 'r1', authorId: 'stu-1' });

    expect(prisma.annotation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { content: 'Trimmed', readingId: 'r1', authorId: 'stu-1' },
      }),
    );
  });

  it('creates a reply with parentId', async () => {
    const parent = { id: 'a1', readingId: 'r1', authorId: 'stu-1' };
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(parent as any);
    vi.mocked(prisma.annotation.create).mockResolvedValue({
      id: 'a2',
      content: 'Great point!',
      readingId: 'r1',
      authorId: 'stu-2',
      parentId: 'a1',
      author: { id: 'stu-2', name: 'Michael', role: 'student' },
    } as any);

    const res = await request(app)
      .post('/api/annotations')
      .send({ content: 'Great point!', readingId: 'r1', authorId: 'stu-2', parentId: 'a1' });

    expect(res.status).toBe(201);
    expect(res.body.parentId).toBe('a1');
    expect(prisma.annotation.create).toHaveBeenCalledWith({
      data: { content: 'Great point!', readingId: 'r1', authorId: 'stu-2', parentId: 'a1' },
      include: { author: true },
    });
  });

  it('returns 404 for nonexistent parent annotation', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/annotations')
      .send({ content: 'Reply', readingId: 'r1', authorId: 'stu-1', parentId: 'missing' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: Errors.PARENT_NOT_FOUND });
    expect(prisma.annotation.create).not.toHaveBeenCalled();
  });

  it('rejects reply on different reading than parent', async () => {
    const parent = { id: 'a1', readingId: 'r1', authorId: 'stu-1' };
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(parent as any);

    const res = await request(app)
      .post('/api/annotations')
      .send({ content: 'Reply', readingId: 'r2', authorId: 'stu-1', parentId: 'a1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: Errors.REPLY_WRONG_READING });
    expect(prisma.annotation.create).not.toHaveBeenCalled();
  });
});

const existingAnnotation = {
  id: 'a1',
  content: 'Original content',
  readingId: 'r1',
  authorId: 'stu-1',
  createdAt: '2024-01-20T00:00:00.000Z',
};

describe('PATCH /api/annotations/:id', () => {
  it('updates annotation content', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(existingAnnotation as any);
    vi.mocked(prisma.annotation.update).mockResolvedValue({
      ...existingAnnotation,
      content: 'Updated content',
      author: mockStudent,
    } as any);

    const res = await request(app)
      .patch('/api/annotations/a1')
      .send({ content: 'Updated content', authorId: 'stu-1' });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Updated content');
  });

  it('rejects empty content with 400', async () => {
    const res = await request(app)
      .patch('/api/annotations/a1')
      .send({ content: '', authorId: 'stu-1' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: Errors.ANNOTATION_EMPTY });
  });

  it('returns 404 for nonexistent annotation', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/annotations/missing')
      .send({ content: 'Updated', authorId: 'stu-1' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: Errors.ANNOTATION_NOT_FOUND });
  });

  it('rejects edit by non-author with 403', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(existingAnnotation as any);

    const res = await request(app)
      .patch('/api/annotations/a1')
      .send({ content: 'Hacked', authorId: 'stu-2' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: Errors.EDIT_OWN_ONLY });
    expect(prisma.annotation.update).not.toHaveBeenCalled();
  });

  it('trims whitespace from updated content', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(existingAnnotation as any);
    vi.mocked(prisma.annotation.update).mockResolvedValue({
      ...existingAnnotation,
      content: 'Trimmed',
      author: mockStudent,
    } as any);

    await request(app)
      .patch('/api/annotations/a1')
      .send({ content: '  Trimmed  ', authorId: 'stu-1' });

    expect(prisma.annotation.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: { content: 'Trimmed' },
      include: { author: true },
    });
  });
});

describe('DELETE /api/annotations/:id', () => {
  it('deletes annotation and returns success', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(existingAnnotation as any);
    vi.mocked(prisma.annotation.delete).mockResolvedValue(existingAnnotation as any);

    const res = await request(app).delete('/api/annotations/a1').send({ authorId: 'stu-1' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(prisma.annotation.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
  });

  it('returns 404 for nonexistent annotation', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(null);

    const res = await request(app).delete('/api/annotations/missing').send({ authorId: 'stu-1' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: Errors.ANNOTATION_NOT_FOUND });
  });

  it('rejects delete by non-author with 403', async () => {
    vi.mocked(prisma.annotation.findUnique).mockResolvedValue(existingAnnotation as any);

    const res = await request(app).delete('/api/annotations/a1').send({ authorId: 'stu-2' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: Errors.DELETE_OWN_ONLY });
    expect(prisma.annotation.delete).not.toHaveBeenCalled();
  });
});
