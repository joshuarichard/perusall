import path from 'node:path';
import { defineConfig } from 'prisma/config';

const dbPath = path.join(import.meta.dirname, 'prisma', 'dev.db');

export default defineConfig({
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: `file:${dbPath}`,
  },
});
