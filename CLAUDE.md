# Perusall Collaborative Reading App

## Project Overview

A full-stack Collaborative Reading App built as a take-home exercise for Perusall's Sr. Software Engineer role. Instructors assign readings; students discuss them through annotations.

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** — fast dev server with HMR, ESBuild-powered bundling
- **Redux Toolkit (RTK)** — state management with RTK Query for API layer
- **Styled Components** — CSS-in-JS with theme support

### Backend

- **Express.js** with TypeScript
- **SQLite** via `better-sqlite3` — zero-config, file-based database
- **Prisma** — type-safe ORM with auto-generated TypeScript types

### Project Structure

```
perusall/
├── client/                 # Vite + React frontend
│   ├── src/
│   │   ├── app/            # Redux store + RTK Query API
│   │   ├── components/     # Reusable UI components
│   │   ├── features/auth/  # Auth slice (user selection)
│   │   ├── pages/          # Route-level page components
│   │   └── styles/         # Styled Components theme + global styles
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   ├── data/           # Database client + seed script (barrel: index.ts)
│   │   ├── routes/         # API route handlers (barrel: index.ts)
│   │   └── types.ts        # Shared TypeScript interfaces
│   ├── prisma/             # Prisma schema + migrations
│   └── docs/               # API documentation
└── resources/              # Exercise prompt + reference materials
```

## Key Commands

```bash
# Install all dependencies
npm install

# Start development (both client + server)
npm run dev

# Client only (Vite dev server on :5173)
npm run dev:client

# Server only (Express on :3001)
npm run dev:server

# Seed the database with sample data
npm run seed

# Run Prisma migrations
npm run db:migrate

# Type check
npm run typecheck

# Run all tests
npm run test

# Server tests only
npm run test:server

# Client tests only
npm run test:client
```

## Data Model

### Users (simulated — no real auth)

- `id`: string (UUID)
- `name`: string
- `role`: "instructor" | "student"

### Readings

- `id`: string (UUID)
- `title`: string
- `description`: string
- `createdBy`: string (user ID)
- `createdAt`: datetime

### Annotations

- `id`: string (UUID)
- `readingId`: string (foreign key)
- `authorId`: string (foreign key → User)
- `content`: string (non-empty, validated)
- `createdAt`: datetime

## API Endpoints

```
GET    /api/users              # List available users
GET    /api/readings           # List all readings (with annotation counts)
POST   /api/readings           # Create a reading (instructor only)
GET    /api/readings/:id       # Get a single reading with annotations
POST   /api/annotations        # Create an annotation (student only)
GET    /api/readings/:id/stats # Instructor stats (annotation count, unique students)
```

## Testing

- **Framework**: Vitest for both client and server
- **Server tests**: Supertest with mocked Prisma client, colocated next to route files
- **Client tests**: React Testing Library + user-event, colocated next to source files
- Tests are colocated: `Component.test.tsx` sits next to `Component.tsx`

## Coding Conventions

- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- Styled Components use PascalCase with `Styled` prefix (e.g., `StyledCard`)
- Redux slices follow RTK conventions with `createSlice` and `createApi`
- API calls go through RTK Query — no raw fetch/axios in components
- Barrel files (`index.ts`) for `data/` and `routes/` directories
- Extensionless local imports (no `.js` suffixes)
- Comments explain _why_, not _what_
- Error boundaries at route level
