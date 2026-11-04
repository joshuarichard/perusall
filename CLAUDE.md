# Perusall Collaborative Reading App

Full-stack collaborative reading app — Perusall Sr. SWE take-home exercise. See README.md for architecture, features, and API reference.

## Commands

```bash
npm run dev              # Start client (:5173) + server (:3001)
npm run dev:client       # Client only
npm run dev:server       # Server only
npm run seed             # Seed database with sample data
npm run db:migrate       # Run Prisma migrations
npm run db:setup         # Migrate + seed
npm run db:reset         # Reset DB and re-seed
npm run typecheck        # TypeScript type checking
npm run test             # Unit tests (server + client)
npm run test:server      # Server unit tests only
npm run test:client      # Client unit tests only
npm run test:integration # Server integration tests (real SQLite)
npm run test:e2e         # Playwright E2E tests
```

Coding conventions, testing patterns, API patterns, and i18n/theming rules are in `.claude/rules/`.
