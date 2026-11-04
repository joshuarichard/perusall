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

describe('GET /api/users', () => {
  it('returns empty array when no users exist', async () => {
    const res = await request.get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns users ordered by name', async () => {
    await prisma.user.create({ data: { name: 'Zara', role: 'student' } });
    await prisma.user.create({ data: { name: 'Alice', role: 'instructor' } });
    await prisma.user.create({ data: { name: 'Michael', role: 'student' } });

    const res = await request.get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].name).toBe('Alice');
    expect(res.body[1].name).toBe('Michael');
    expect(res.body[2].name).toBe('Zara');
  });

  it('includes user role and id', async () => {
    await prisma.user.create({ data: { name: 'Dr. Smith', role: 'instructor' } });

    const res = await request.get('/api/users');
    expect(res.body[0]).toMatchObject({
      name: 'Dr. Smith',
      role: 'instructor',
    });
    expect(res.body[0].id).toBeDefined();
    expect(res.body[0].createdAt).toBeDefined();
  });
});
