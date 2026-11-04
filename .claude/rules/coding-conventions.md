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

## React

- Functional components with hooks (no class components)
- Named exports for components, default exports for pages
- API calls go through RTK Query — no raw fetch/axios in components
- Redux slices follow RTK conventions with `createSlice` and `createApi`
- Error boundaries at route level

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
