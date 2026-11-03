Things to discuss before we start coding:

1. Backend choice — I defaulted to Express + Prisma + SQLite. The
   panel-ready answer: "SQLite eliminates setup friction for
   reviewers, Prisma gives us type-safe queries that share
   TypeScript's type system with the frontend, and Express is minimal
   enough that the code speaks for itself."
2. Redux Toolkit vs vanilla Redux — I went with RTK. Panel answer:
   "RTK is the officially recommended approach per the Redux docs.
   RTK Query handles API caching, request deduplication, and cache
   invalidation — it replaces hand-written thunks and normalizing
   state."
3. No WebSockets — For "display new annotations without refreshing,"
   we'll use optimistic updates (update the Redux store immediately
   on successful POST). Panel answer: "WebSockets would be the right
   call for multi-user real-time, but for this scope, optimistic
   updates are simpler and sufficient."
