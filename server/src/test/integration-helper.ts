import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import type { PrismaClient } from '@prisma/client';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient: PrismaClientRuntime } = require('@prisma/client');

const SCHEMA_SQL = `
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Reading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reading_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "readingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Annotation_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Annotation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Annotation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Annotation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
`;

export function createTestPrisma() {
  const dbPath = path.join(
    os.tmpdir(),
    `perusall-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);
  db.close();

  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma: PrismaClient = new PrismaClientRuntime({ adapter });

  return { prisma, dbPath };
}

export async function cleanDatabase(prisma: PrismaClient) {
  await prisma.annotation.deleteMany();
  await prisma.reading.deleteMany();
  await prisma.user.deleteMany();
}

export function removeTestDb(dbPath: string) {
  try {
    fs.unlinkSync(dbPath);
  } catch {
    // ignore if already removed
  }
}
