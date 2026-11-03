# Perusall Collaborative Reading App

A full-stack collaborative reading application where college instructors can assign readings and students can discuss them through annotations.

Built with TypeScript, React, Redux Toolkit, Styled Components, Vite, Express, and SQLite.

## Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

No external database installation required — SQLite runs embedded.

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd perusall

# Install dependencies
npm install

# Set up the database (run migrations + seed sample data)
npm run db:setup

# Start the development servers
npm run dev
```

The app will be available at:

- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:3001

### Sample Data

Running `npm run db:setup` populates the database with:

- **2 Instructors**: Dr. Smith, Prof. Johnson
- **3 Students**: Sarah, Michael, Alex
- **3 Sample Readings**: covering machine learning, Shakespeare, and climate science
- **Several annotations**: demonstrating the discussion flow

To reset the database at any time:

```bash
npm run db:reset
```

## Architecture

### Stack Decisions

| Layer            | Choice                    | Why                                                                       |
| ---------------- | ------------------------- | ------------------------------------------------------------------------- |
| **Build Tool**   | Vite                      | Near-instant HMR, native ESM, minimal config                              |
| **UI Framework** | React 18 + TypeScript     | Type safety, component model, ecosystem                                   |
| **State**        | Redux Toolkit + RTK Query | Eliminates Redux boilerplate, built-in API caching and cache invalidation |
| **Styling**      | Styled Components         | Scoped CSS-in-JS, theming support, dynamic styles via props               |
| **Server**       | Express + TypeScript      | Lightweight, familiar, same language as frontend                          |
| **Database**     | SQLite via Prisma         | Zero-config, file-based, type-safe queries, easy local setup              |

### Project Structure

```
perusall/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── app/            # Redux store configuration
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature modules (readings, annotations, auth)
│   │   ├── pages/          # Route-level page components
│   │   └── styles/         # Theme + global styles
│   └── vite.config.ts
├── server/                 # Express API server
│   ├── src/
│   │   ├── data/           # Database client + seed script (barrel: index.ts)
│   │   ├── routes/         # REST API route handlers (barrel: index.ts)
│   │   └── types.ts        # Shared TypeScript interfaces
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── docs/               # API documentation
└── resources/              # Exercise materials
```

### Data Model

```
User (simulated)     Reading              Annotation
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ id           │     │ id           │     │ id           │
│ name         │     │ title        │     │ readingId  ──┼──→ Reading
│ role         │     │ description  │     │ authorId   ──┼──→ User
└──────────────┘     │ createdBy  ──┼──→  │ content      │
                     │ createdAt    │     │ createdAt    │
                     └──────────────┘     └──────────────┘
```

### API Endpoints

| Method | Endpoint                  | Description                              | Role       |
| ------ | ------------------------- | ---------------------------------------- | ---------- |
| `GET`  | `/api/users`              | List available users                     | Any        |
| `GET`  | `/api/readings`           | List all readings with annotation counts | Any        |
| `POST` | `/api/readings`           | Create a new reading                     | Instructor |
| `GET`  | `/api/readings/:id`       | Get reading with its annotations         | Any        |
| `POST` | `/api/annotations`        | Add annotation to a reading              | Student    |
| `GET`  | `/api/readings/:id/stats` | Reading engagement statistics            | Instructor |

## Features

### For Students

- Browse available readings
- View reading details and existing annotations
- Add annotations (comments) to readings
- See annotations appear instantly without page refresh

### For Instructors

- Create new readings with title and description
- View annotation counts per reading
- See unique student participation counts
- Review all annotations for any reading

### UX Details

- Role-based UI — select identity to simulate login
- Empty state handling for readings and annotations
- Success/error toast notifications
- Annotations displayed in reverse chronological order
- Form validation prevents empty submissions

## Development

### Available Scripts

```bash
npm run dev           # Start both client and server in dev mode
npm run dev:client    # Start only the Vite dev server
npm run dev:server    # Start only the Express server
npm run build         # Build for production
npm run db:setup      # Run migrations + seed data
npm run db:reset      # Reset database and re-seed
npm run db:migrate    # Run Prisma migrations only
npm run seed          # Seed database only
npm run typecheck     # TypeScript type checking
npm run test          # Run all tests (server + client)
npm run test:server   # Server tests only
npm run test:client   # Client tests only
```

## Testing

- **Vitest** for both client and server
- **Server**: Supertest integration tests with mocked Prisma, colocated next to route files
- **Client**: React Testing Library + user-event, colocated next to source files
- 50 tests total (18 server + 32 client)
