---
description: API and data layer patterns
globs: server/src/**/*.ts,shared/types.ts,client/src/app/api.ts
---

# API & Data Patterns

## Wire Types
- Defined in `shared/types.ts`, shared by client and server
- `createdAt` is `string` (not `Date`) because JSON serialization converts Date to ISO string
- Client re-exports via `@shared` alias through `client/src/app/types.ts`

## RTK Query
- All API endpoints defined in `client/src/app/api.ts`
- Tag-based cache invalidation: `providesTags` / `invalidatesTags`
- Tag types: `'Reading'` (list-level), `'ReadingDetail'` (per-reading)
- Mutations that change readings invalidate `['Reading']` to refresh lists and dashboard

## Server Routes
- Express routers in `server/src/routes/`, exported via barrel `index.ts`
- Registered in `server/src/app.ts`
- Request body types in `server/src/types.ts`

## Data Model (Prisma)
- Schema at `server/prisma/schema.prisma`
- User → role is `"instructor"` or `"student"` (simulated auth via user selection)
- Reading → belongs to User (creator) via `createdBy`
- Annotation → belongs to Reading + User; self-referential `parentId` for threaded replies
- Server builds annotation trees from flat query using in-memory Map

## Route Guards
- `RequireAuth` — redirects to `/` if no user selected
- `RequireInstructor` — redirects to `/readings` if user is not an instructor
