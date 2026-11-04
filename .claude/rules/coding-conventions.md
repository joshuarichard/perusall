---
description: Coding conventions and style rules for the Perusall codebase
globs: **/*.{ts,tsx}
---

# Coding Conventions

## TypeScript

- Strict mode enabled on both client and server (`strict: true`)
- Prefer `interface` for object structures/API contracts and `type` for unions/intersections
- Use `extends` for interface composition (e.g. `interface Reading extends ReadingBase`)
- Extensionless local imports (no `.js` suffixes)
- Shared wire types live in `shared/types.ts`; client re-exports via `@shared` alias
- Enforce type-only imports using `import type { ... }` for clean compilation boundaries
- Server request body types derived from Zod schemas via `z.infer<>` — don't duplicate as manual interfaces

## React

- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- Error boundaries at route level

## Redux Toolkit & RTK Query

- All API endpoints defined in a single `createApi` call in `client/src/app/api.ts`
- No raw `fetch`/`axios` in components — all data fetching goes through RTK Query hooks
- Tag-based cache invalidation: queries declare `providesTags`, mutations declare `invalidatesTags`
- Tag types: `'Reading'` (list-level, also used by dashboard) and `'ReadingDetail'` (per-reading)
- Export generated hooks (`useGetReadingsQuery`, `useCreateReadingMutation`, etc.) from `api.ts`
- Use `useAppSelector` and `useAppDispatch` from `app/hooks.ts` — pre-typed to the store
- Auth state managed via `createSlice` in `app/authSlice.ts` (simulated login, not production auth)

## Styled Components

- PascalCase with `Styled` prefix (e.g., `StyledCard`, `StyledButton`)
- Button backgrounds use `buttonPrimary`/`buttonPrimaryHover` tokens (separate from `primary` for dark mode contrast)
- Prefer extending shared styled components via `styled(BaseComponent)` over duplicating CSS

## File Organization

- Barrel files (`index.ts`) for `components/`, `styles/`, `data/`, and `routes/`
- No `app/` barrel — conflicts with `App.tsx` on case-insensitive filesystems
- Colocated tests: `*.test.ts(x)` next to source files
- Integration tests: `*.integration.test.ts`

## Comments

- Comments explain _why_, not _what_
- No multi-paragraph docstrings or multi-line comment blocks

## Accessibility

- WCAG AA color contrast (4.5:1 normal text, 3:1 large text/UI)
- `:focus-visible` outlines globally
- `aria-label` on form controls without visible labels
- `role="alert"` / `aria-live` on dynamic messages
- Keyboard-navigable interactive elements
- `document.documentElement.lang` synced to locale
