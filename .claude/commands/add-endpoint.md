Add a new API endpoint to the server. Argument: description of the endpoint.

Follow this checklist:

1. **Type** — Add request/response types to `server/src/types.ts` (request body) and `shared/types.ts` (response wire type). Use type composition where possible.
2. **Route** — Create or update a router in `server/src/routes/`. Export from the barrel `server/src/routes/index.ts`.
3. **Register** — Mount the router in `server/src/app.ts` if it's a new router.
4. **RTK Query** — Add the endpoint to `client/src/app/api.ts` with appropriate `providesTags`/`invalidatesTags`. Export the generated hook. Add wire types to `client/src/app/types.ts` re-exports if needed.
5. **Unit test** — Add a colocated `*.test.ts` with mocked Prisma client.
6. **Integration test** — Add a colocated `*.integration.test.ts` with real temp SQLite DB.
7. **Error messages** — Add any new error strings to the `Errors` constant in `server/src/types.ts`.
8. **Typecheck** — Run `npm run typecheck` to verify.
9. **Tests** — Run `npm run test:server` and `npm run test:integration` to verify.
10. **Docs** — Update the API table in `README.md`.

$ARGUMENTS
