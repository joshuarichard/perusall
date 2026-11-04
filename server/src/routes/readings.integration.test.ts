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

async function seedInstructor() {
  return prisma.user.create({ data: { name: 'Dr. Smith', role: 'instructor' } });
}

async function seedStudent() {
  return prisma.user.create({ data: { name: 'Sarah', role: 'student' } });
}

async function seedReading(createdBy: string) {
  return prisma.reading.create({
    data: { title: 'Test Reading', description: 'A test reading', createdBy },
  });
}

describe('GET /api/readings', () => {
  it('returns empty array when no readings exist', async () => {
    const res = await request.get('/api/readings');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns readings ordered by newest first', async () => {
    const instructor = await seedInstructor();
    await prisma.reading.create({
      data: {
        title: 'Older Reading',
        description: 'First',
        createdBy: instructor.id,
        createdAt: new Date('2026-01-01'),
      },
    });
    await prisma.reading.create({
      data: {
        title: 'Newer Reading',
        description: 'Second',
        createdBy: instructor.id,
        createdAt: new Date('2026-06-01'),
      },
    });

    const res = await request.get('/api/readings');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Newer Reading');
    expect(res.body[1].title).toBe('Older Reading');
  });

  it('includes creator and annotation count', async () => {
    const instructor = await seedInstructor();
    const student = await seedStudent();
    const reading = await seedReading(instructor.id);
    await prisma.annotation.create({
      data: { content: 'Note 1', readingId: reading.id, authorId: student.id },
    });
    await prisma.annotation.create({
      data: { content: 'Note 2', readingId: reading.id, authorId: student.id },
    });

    const res = await request.get('/api/readings');
    expect(res.body[0].creator.name).toBe('Dr. Smith');
    expect(res.body[0]._count.annotations).toBe(2);
  });
});

describe('GET /api/readings/:id', () => {
  it('returns 404 for nonexistent reading', async () => {
    const res = await request.get('/api/readings/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe(Errors.READING_NOT_FOUND);
  });

  it('returns reading with annotations as a tree', async () => {
    const instructor = await seedInstructor();
    const student = await seedStudent();
    const reading = await seedReading(instructor.id);

    const parent = await prisma.annotation.create({
      data: { content: 'Top-level', readingId: reading.id, authorId: student.id },
    });
    await prisma.annotation.create({
      data: { content: 'Reply', readingId: reading.id, authorId: student.id, parentId: parent.id },
    });

    const res = await request.get(`/api/readings/${reading.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Reading');
    expect(res.body.annotations).toHaveLength(1);
    expect(res.body.annotations[0].content).toBe('Top-level');
    expect(res.body.annotations[0].replies).toHaveLength(1);
    expect(res.body.annotations[0].replies[0].content).toBe('Reply');
  });

  it('builds deep nested reply trees', async () => {
    const instructor = await seedInstructor();
    const student = await seedStudent();
    const reading = await seedReading(instructor.id);

    const level1 = await prisma.annotation.create({
      data: { content: 'Level 1', readingId: reading.id, authorId: student.id },
    });
    const level2 = await prisma.annotation.create({
      data: {
        content: 'Level 2',
        readingId: reading.id,
        authorId: student.id,
        parentId: level1.id,
      },
    });
    await prisma.annotation.create({
      data: {
        content: 'Level 3',
        readingId: reading.id,
        authorId: student.id,
        parentId: level2.id,
      },
    });

    const res = await request.get(`/api/readings/${reading.id}`);
    const tree = res.body.annotations;
    expect(tree).toHaveLength(1);
    expect(tree[0].content).toBe('Level 1');
    expect(tree[0].replies[0].content).toBe('Level 2');
    expect(tree[0].replies[0].replies[0].content).toBe('Level 3');
  });

  it('sorts top-level annotations newest first', async () => {
    const instructor = await seedInstructor();
    const student = await seedStudent();
    const reading = await seedReading(instructor.id);

    await prisma.annotation.create({
      data: {
        content: 'Older',
        readingId: reading.id,
        authorId: student.id,
        createdAt: new Date('2026-01-01'),
      },
    });
    await prisma.annotation.create({
      data: {
        content: 'Newer',
        readingId: reading.id,
        authorId: student.id,
        createdAt: new Date('2026-06-01'),
      },
    });

    const res = await request.get(`/api/readings/${reading.id}`);
    expect(res.body.annotations[0].content).toBe('Newer');
    expect(res.body.annotations[1].content).toBe('Older');
  });
});

describe('POST /api/readings', () => {
  it('creates a reading and returns it with creator', async () => {
    const instructor = await seedInstructor();

    const res = await request.post('/api/readings').send({
      title: 'New Reading',
      description: 'A brand new reading',
      createdBy: instructor.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Reading');
    expect(res.body.description).toBe('A brand new reading');
    expect(res.body.creator.name).toBe('Dr. Smith');
    expect(res.body._count.annotations).toBe(0);
    expect(res.body.id).toBeDefined();
  });

  it('persists the reading to the database', async () => {
    const instructor = await seedInstructor();

    await request.post('/api/readings').send({
      title: 'Persisted Reading',
      description: 'Should be in DB',
      createdBy: instructor.id,
    });

    const readings = await prisma.reading.findMany();
    expect(readings).toHaveLength(1);
    expect(readings[0].title).toBe('Persisted Reading');
  });

  it('trims whitespace from title and description', async () => {
    const instructor = await seedInstructor();

    const res = await request.post('/api/readings').send({
      title: '  Whitespace Title  ',
      description: '  Whitespace Description  ',
      createdBy: instructor.id,
    });

    expect(res.body.title).toBe('Whitespace Title');
    expect(res.body.description).toBe('Whitespace Description');
  });

  it('rejects empty title', async () => {
    const instructor = await seedInstructor();

    const res = await request.post('/api/readings').send({
      title: '',
      description: 'Has description',
      createdBy: instructor.id,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(Errors.TITLE_AND_DESCRIPTION_REQUIRED);
  });

  it('rejects empty description', async () => {
    const instructor = await seedInstructor();

    const res = await request.post('/api/readings').send({
      title: 'Has title',
      description: '   ',
      createdBy: instructor.id,
    });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/readings/:id', () => {
  it('deletes a reading and all its annotations', async () => {
    const instructor = await seedInstructor();
    const student = await seedStudent();
    const reading = await seedReading(instructor.id);
    await prisma.annotation.create({
      data: { content: 'Note', readingId: reading.id, authorId: student.id },
    });

    const res = await request.delete(`/api/readings/${reading.id}`).send({ userId: instructor.id });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    const readings = await prisma.reading.findMany();
    expect(readings).toHaveLength(0);
    const annotations = await prisma.annotation.findMany();
    expect(annotations).toHaveLength(0);
  });

  it('returns 404 for nonexistent reading', async () => {
    const res = await request.delete('/api/readings/nonexistent').send({ userId: 'any' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe(Errors.READING_NOT_FOUND);
  });

  it('returns 403 when user is not the creator', async () => {
    const instructor = await seedInstructor();
    const student = await seedStudent();
    const reading = await seedReading(instructor.id);

    const res = await request.delete(`/api/readings/${reading.id}`).send({ userId: student.id });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(Errors.DELETE_OWN_READING_ONLY);

    const readings = await prisma.reading.findMany();
    expect(readings).toHaveLength(1);
  });

  it('does not affect other readings', async () => {
    const instructor = await seedInstructor();
    const reading1 = await seedReading(instructor.id);
    const reading2 = await prisma.reading.create({
      data: { title: 'Other Reading', description: 'Keep this', createdBy: instructor.id },
    });

    await request.delete(`/api/readings/${reading1.id}`).send({ userId: instructor.id });

    const readings = await prisma.reading.findMany();
    expect(readings).toHaveLength(1);
    expect(readings[0].id).toBe(reading2.id);
  });
});

describe('GET /api/readings/:id/stats', () => {
  it('returns 404 for nonexistent reading', async () => {
    const res = await request.get('/api/readings/nonexistent/stats');
    expect(res.status).toBe(404);
  });

  it('returns correct annotation count and unique students', async () => {
    const instructor = await seedInstructor();
    const student1 = await seedStudent();
    const student2 = await prisma.user.create({ data: { name: 'Michael', role: 'student' } });
    const reading = await seedReading(instructor.id);

    await prisma.annotation.create({
      data: { content: 'A', readingId: reading.id, authorId: student1.id },
    });
    await prisma.annotation.create({
      data: { content: 'B', readingId: reading.id, authorId: student1.id },
    });
    await prisma.annotation.create({
      data: { content: 'C', readingId: reading.id, authorId: student2.id },
    });

    const res = await request.get(`/api/readings/${reading.id}/stats`);
    expect(res.status).toBe(200);
    expect(res.body.readingId).toBe(reading.id);
    expect(res.body.annotationCount).toBe(3);
    expect(res.body.uniqueStudents).toBe(2);
  });

  it('returns zero counts for reading with no annotations', async () => {
    const instructor = await seedInstructor();
    const reading = await seedReading(instructor.id);

    const res = await request.get(`/api/readings/${reading.id}/stats`);
    expect(res.body.annotationCount).toBe(0);
    expect(res.body.uniqueStudents).toBe(0);
  });
});
