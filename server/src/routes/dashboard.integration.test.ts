import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import type { PrismaClient } from '@prisma/client';
import { createTestPrisma, cleanDatabase, removeTestDb } from '../test/integration-helper';

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

async function seedStudent(name = 'Sarah') {
  return prisma.user.create({ data: { name, role: 'student' } });
}

async function seedReading(createdBy: string, title = 'Test Reading') {
  return prisma.reading.create({
    data: { title, description: 'A test reading', createdBy },
  });
}

describe('GET /api/dashboard', () => {
  it('returns empty dashboard when no readings exist', async () => {
    const res = await request.get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.summary).toEqual({
      totalReadings: 0,
      totalAnnotations: 0,
      uniqueStudents: 0,
    });
    expect(res.body.readings).toEqual([]);
    expect(res.body.students).toEqual([]);
  });

  it('returns correct per-reading stats', async () => {
    const instructor = await seedInstructor();
    const student1 = await seedStudent('Alice');
    const student2 = await seedStudent('Bob');
    const reading = await seedReading(instructor.id, 'Intro to CS');

    await prisma.annotation.createMany({
      data: [
        { content: 'Note 1', readingId: reading.id, authorId: student1.id },
        { content: 'Note 2', readingId: reading.id, authorId: student1.id },
        { content: 'Note 3', readingId: reading.id, authorId: student2.id },
      ],
    });

    const res = await request.get('/api/dashboard');

    expect(res.body.summary.totalReadings).toBe(1);
    expect(res.body.summary.totalAnnotations).toBe(3);
    expect(res.body.summary.uniqueStudents).toBe(2);

    const readingStat = res.body.readings[0];
    expect(readingStat.title).toBe('Intro to CS');
    expect(readingStat.annotationCount).toBe(3);
    expect(readingStat.uniqueStudents).toBe(2);
    expect(readingStat.lastActivity).toBeDefined();
  });

  it('tracks student participation across multiple readings', async () => {
    const instructor = await seedInstructor();
    const student = await seedStudent('Alice');
    const reading1 = await seedReading(instructor.id, 'Reading 1');
    const reading2 = await seedReading(instructor.id, 'Reading 2');

    await prisma.annotation.create({
      data: { content: 'Note A', readingId: reading1.id, authorId: student.id },
    });
    await prisma.annotation.create({
      data: { content: 'Note B', readingId: reading2.id, authorId: student.id },
    });

    const res = await request.get('/api/dashboard');

    expect(res.body.students).toHaveLength(1);
    expect(res.body.students[0]).toMatchObject({
      name: 'Alice',
      annotationCount: 2,
      readingsParticipated: 2,
    });
  });

  it('handles readings with no annotations', async () => {
    const instructor = await seedInstructor();
    await seedReading(instructor.id, 'Empty Reading');

    const res = await request.get('/api/dashboard');

    expect(res.body.summary.totalReadings).toBe(1);
    expect(res.body.summary.totalAnnotations).toBe(0);
    expect(res.body.readings[0].annotationCount).toBe(0);
    expect(res.body.readings[0].lastActivity).toBeNull();
    expect(res.body.students).toEqual([]);
  });
});
