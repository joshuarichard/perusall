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

## Project Structure

```
perusall/
├── shared/
│   └── types.ts          # Shared wire types (User, Reading, Annotation, etc.)
├── client/src/
│   ├── app/              # Redux store, RTK Query API, auth slice (hooks.ts, types.ts)
│   ├── components/       # Reusable UI primitives (barrel: index.ts)
│   ├── i18n/             # I18n context, translations, hook (barrel: index.ts)
│   ├── pages/            # Route-level pages + colocated tests
│   └── styles/           # Theme, dark mode, global styles (barrel: index.ts)
├── server/src/
│   ├── data/             # Prisma client + seed script (barrel: index.ts)
│   ├── routes/           # API handlers + colocated tests (barrel: index.ts)
│   ├── test/             # Integration test helper (creates temp SQLite DBs)
│   └── types.ts          # Server-only request body types + centralized API error constants
├── server/prisma/        # Schema + migrations
├── e2e/                  # Playwright E2E tests
└── playwright.config.ts
```

## Coding Conventions

- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- Styled Components use PascalCase with `Styled` prefix (e.g., `StyledCard`)
- Redux slices follow RTK conventions with `createSlice` and `createApi`
- API calls go through RTK Query — no raw fetch/axios in components
- Barrel files (`index.ts`) for `components/`, `styles/`, `data/`, and `routes/`
- No `app/` barrel — conflicts with `App.tsx` on case-insensitive filesystems
- `type` aliases over `interface` for all type definitions
- Shared wire types live in `shared/types.ts`; client re-exports via `@shared` alias
- Dark mode via `ThemeContext` with localStorage persistence + `prefers-color-scheme` fallback
- i18n via `I18nContext` with `useTranslation` hook; translations in `i18n/translations.ts`; localStorage persistence + `navigator.language` fallback
- API error messages centralized in `Errors` constant (`server/src/types.ts`); routes and tests reference the constant
- Strict TypeScript (`strict: true`) enabled on both client and server
- Perusall brand colors (crimson red) — theme tokens in `styles/theme.ts`
- Extensionless local imports (no `.js` suffixes)
- Comments explain _why_, not _what_
- Error boundaries at route level

## Testing Approach

- **Unit tests** (Vitest): colocated `*.test.ts(x)` files next to source
  - Server: Supertest with mocked Prisma client
  - Client: React Testing Library + user-event
- **Integration tests** (`*.integration.test.ts`): real temp SQLite DBs via `vi.doMock` + dynamic app import
- **E2E tests** (Playwright): browser-based flows against running dev servers

## Data Model

Prisma schema at `server/prisma/schema.prisma`. Key relations:

- **User** → role is `"instructor"` or `"student"` (simulated auth via user selection)
- **Reading** → belongs to User (creator) via `createdBy`
- **Annotation** → belongs to Reading + User (author); self-referential `parentId` for threaded replies (unlimited depth)

Server builds annotation trees from a flat query using an in-memory Map — see `readings.ts` GET `/:id`.
