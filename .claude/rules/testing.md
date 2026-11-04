---
description: Testing patterns and conventions
globs: **/*.test.{ts,tsx},**/*.integration.test.ts
---

# Testing Approach

## Unit Tests (Vitest)
- Server: Supertest with mocked Prisma client via `vi.mock('../data', ...)`
- Client: React Testing Library + user-event
- Colocated `*.test.ts(x)` files next to source

## Integration Tests
- File pattern: `*.integration.test.ts`
- Real temp SQLite databases via `createTestPrisma()` from `server/src/test/integration-helper`
- Use `vi.doMock` + dynamic `await import('../app')` to inject the test Prisma client
- Clean database between tests with `cleanDatabase(prisma)` in `beforeEach`
- Disconnect and remove temp DB in `afterAll`

## API Error Messages
- Centralized in `Errors` constant at `server/src/types.ts`
- Routes and tests reference the constant — never hardcode error strings

## Running Tests
```bash
npm run test             # All unit tests (server + client)
npm run test:server      # Server unit tests only
npm run test:client      # Client unit tests only
npm run test:integration # Server integration tests (real SQLite)
npm run test:e2e         # Playwright E2E tests (requires dev servers)
```
