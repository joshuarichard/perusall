import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import type { PrismaClient } from '@prisma/client';
import { createTestPrisma, cleanDatabase, removeTestDb } from '../test/integration-helper';
import { Errors } from '../types';

let prisma: PrismaClient;
let dbPath: string;
let request: supertest.Agent;

beforeAll(async () => {
  const testDb = createTestPrisma();
  prisma = testDb.prisma;
  dbPath = testDb.dbPath;

  vi.doMock('../data', () => ({ prisma }));
  const { app } = await import('../app');
  request = supertest(app);
});

afterAll(async () => {
  await prisma.$disconnect();
  removeTestDb(dbPath);
});

beforeEach(async () => {
  await cleanDatabase(prisma);
});

async function seedUsers() {
  const instructor = await prisma.user.create({ data: { name: 'Dr. Smith', role: 'instructor' } });
  const student = await prisma.user.create({ data: { name: 'Sarah', role: 'student' } });
  const student2 = await prisma.user.create({ data: { name: 'Michael', role: 'student' } });
  return { instructor, student, student2 };
}

async function seedReadingWithAnnotation() {
  const { instructor, student, student2 } = await seedUsers();
  const reading = await prisma.reading.create({
    data: { title: 'Test Reading', description: 'Desc', createdBy: instructor.id },
  });
  const annotation = await prisma.annotation.create({
    data: { content: 'First annotation', readingId: reading.id, authorId: student.id },
  });
  return { instructor, student, student2, reading, annotation };
}

describe('POST /api/annotations', () => {
  it('creates an annotation and returns it with author', async () => {
    const { student, reading } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: 'My new annotation',
      readingId: reading.id,
      authorId: student.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('My new annotation');
    expect(res.body.author.name).toBe('Sarah');
    expect(res.body.readingId).toBe(reading.id);
    expect(res.body.id).toBeDefined();
  });

  it('persists the annotation to the database', async () => {
    const { student, reading } = await seedReadingWithAnnotation();

    await request.post('/api/annotations').send({
      content: 'Persisted annotation',
      readingId: reading.id,
      authorId: student.id,
    });

    const annotations = await prisma.annotation.findMany();
    expect(annotations).toHaveLength(2); // seeded + new
    expect(annotations.some((a) => a.content === 'Persisted annotation')).toBe(true);
  });

  it('trims whitespace from content', async () => {
    const { student, reading } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: '  Whitespace content  ',
      readingId: reading.id,
      authorId: student.id,
    });

    expect(res.body.content).toBe('Whitespace content');
  });

  it('rejects empty content', async () => {
    const { student, reading } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: '',
      readingId: reading.id,
      authorId: student.id,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(Errors.ANNOTATION_EMPTY);
  });

  it('rejects whitespace-only content', async () => {
    const { student, reading } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: '   ',
      readingId: reading.id,
      authorId: student.id,
    });

    expect(res.status).toBe(400);
  });

  it('rejects missing readingId', async () => {
    const { student } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: 'Note',
      authorId: student.id,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(Errors.READING_AND_AUTHOR_REQUIRED);
  });

  it('rejects missing authorId', async () => {
    const { reading } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: 'Note',
      readingId: reading.id,
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/annotations (replies)', () => {
  it('creates a reply to an existing annotation', async () => {
    const { student, reading, annotation } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: 'My reply',
      readingId: reading.id,
      authorId: student.id,
      parentId: annotation.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('My reply');
    expect(res.body.parentId).toBe(annotation.id);
  });

  it('allows replies to replies (deep nesting)', async () => {
    const { student, reading, annotation } = await seedReadingWithAnnotation();

    const reply = await prisma.annotation.create({
      data: {
        content: 'First reply',
        readingId: reading.id,
        authorId: student.id,
        parentId: annotation.id,
      },
    });

    const res = await request.post('/api/annotations').send({
      content: 'Reply to reply',
      readingId: reading.id,
      authorId: student.id,
      parentId: reply.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.parentId).toBe(reply.id);
  });

  it('returns 404 for nonexistent parent', async () => {
    const { student, reading } = await seedReadingWithAnnotation();

    const res = await request.post('/api/annotations').send({
      content: 'Reply',
      readingId: reading.id,
      authorId: student.id,
      parentId: 'nonexistent-id',
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(Errors.PARENT_NOT_FOUND);
  });

  it('rejects reply on a different reading than the parent', async () => {
    const { instructor, student, reading, annotation } = await seedReadingWithAnnotation();
    const otherReading = await prisma.reading.create({
      data: { title: 'Other', description: 'Other reading', createdBy: instructor.id },
    });

    const res = await request.post('/api/annotations').send({
      content: 'Cross-reading reply',
      readingId: otherReading.id,
      authorId: student.id,
      parentId: annotation.id,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(Errors.REPLY_WRONG_READING);
  });

  it('replies appear in the reading detail tree', async () => {
    const { student, reading, annotation } = await seedReadingWithAnnotation();

    await request.post('/api/annotations').send({
      content: 'Tree reply',
      readingId: reading.id,
      authorId: student.id,
      parentId: annotation.id,
    });

    const res = await request.get(`/api/readings/${reading.id}`);
    expect(res.body.annotations[0].replies).toHaveLength(1);
    expect(res.body.annotations[0].replies[0].content).toBe('Tree reply');
  });
});

describe('PATCH /api/annotations/:id', () => {
  it('updates annotation content', async () => {
    const { student, annotation } = await seedReadingWithAnnotation();

    const res = await request.patch(`/api/annotations/${annotation.id}`).send({
      content: 'Updated content',
      authorId: student.id,
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Updated content');
  });

  it('persists the update to the database', async () => {
    const { student, annotation } = await seedReadingWithAnnotation();

    await request.patch(`/api/annotations/${annotation.id}`).send({
      content: 'Updated in DB',
      authorId: student.id,
    });

    const updated = await prisma.annotation.findUnique({ where: { id: annotation.id } });
    expect(updated!.content).toBe('Updated in DB');
  });

  it('rejects edit by non-owner', async () => {
    const { student2, annotation } = await seedReadingWithAnnotation();

    const res = await request.patch(`/api/annotations/${annotation.id}`).send({
      content: 'Hacked',
      authorId: student2.id,
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(Errors.EDIT_OWN_ONLY);
  });

  it('returns 404 for nonexistent annotation', async () => {
    const { student } = await seedReadingWithAnnotation();

    const res = await request.patch('/api/annotations/nonexistent').send({
      content: 'Nope',
      authorId: student.id,
    });

    expect(res.status).toBe(404);
  });

  it('rejects empty content', async () => {
    const { student, annotation } = await seedReadingWithAnnotation();

    const res = await request.patch(`/api/annotations/${annotation.id}`).send({
      content: '',
      authorId: student.id,
    });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/annotations/:id', () => {
  it('deletes an annotation', async () => {
    const { student, annotation } = await seedReadingWithAnnotation();

    const res = await request.delete(`/api/annotations/${annotation.id}`).send({
      authorId: student.id,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('removes the annotation from the database', async () => {
    const { student, annotation } = await seedReadingWithAnnotation();

    await request.delete(`/api/annotations/${annotation.id}`).send({
      authorId: student.id,
    });

    const found = await prisma.annotation.findUnique({ where: { id: annotation.id } });
    expect(found).toBeNull();
  });

  it('rejects deletion by non-owner', async () => {
    const { student2, annotation } = await seedReadingWithAnnotation();

    const res = await request.delete(`/api/annotations/${annotation.id}`).send({
      authorId: student2.id,
    });

    expect(res.status).toBe(403);
  });

  it('returns 404 for nonexistent annotation', async () => {
    const { student } = await seedReadingWithAnnotation();

    const res = await request.delete('/api/annotations/nonexistent').send({
      authorId: student.id,
    });

    expect(res.status).toBe(404);
  });
});
