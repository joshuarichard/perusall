Add a new feature end-to-end. Argument: description of the feature.

Follow this checklist:

1. **Plan** — Identify what's needed: types, API endpoint(s), page/component, route, i18n strings, tests.
2. **Types** — Add wire types to `shared/types.ts`, request body types to `server/src/types.ts`.
3. **Backend** — Create route handler(s), export from barrel, register in `app.ts`.
4. **RTK Query** — Add endpoint(s) to `client/src/app/api.ts` with cache tags.
5. **Component/Page** — Create the UI. Use shared styled components from `client/src/components/`. Default export for pages, named exports for components.
6. **Routing** — Add route in `App.tsx`. Use `RequireAuth` or `RequireInstructor` guard as needed.
7. **Navigation** — Add nav link in `Layout.tsx` if appropriate (conditional on role if instructor-only).
8. **i18n** — Add all user-facing strings to both `en` and `es` in `client/src/i18n/translations.ts`.
9. **Tests** — Server unit tests (mocked Prisma), integration tests (real SQLite), client tests if complex UI logic.
10. **Verify** — Run `npm run typecheck`, `npm run test:server`, `npm run test:integration`, `npm run test:client`.
11. **Docs** — Update README.md (features table, API table, test counts) and CLAUDE.md if conventions changed.

$ARGUMENTS
