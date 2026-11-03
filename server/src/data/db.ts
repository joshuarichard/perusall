import path from 'node:path';
import { createRequire } from 'node:module';
import type { PrismaClient } from '.prisma/client';

// Prisma 7 uses "driver adapters" — you bring your own database driver
// instead of Prisma bundling one. This gives us direct control over the
// SQLite connection and lets Prisma stay driver-agnostic.
const require = createRequire(import.meta.url);
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient: PrismaClientRuntime } = require('@prisma/client');

const dbPath = path.join(import.meta.dirname, '..', 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });

export const prisma: PrismaClient = new PrismaClientRuntime({ adapter });
