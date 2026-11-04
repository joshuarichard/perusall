Run an accessibility audit on the codebase.

Check for:

1. **Color contrast** — Verify WCAG AA ratios (4.5:1 normal text, 3:1 large text/UI components) for all theme colors in `client/src/styles/theme.ts` against their backgrounds in both light and dark themes.
2. **Form controls** — Every `<input>`, `<select>`, and `<textarea>` must have an `aria-label` or associated `<label>`.
3. **Dynamic content** — Messages that appear/disappear should have `role="alert"` or `aria-live`.
4. **Keyboard navigation** — Interactive elements (clickable divs, cards) need `tabIndex`, `role`, and `onKeyDown` handlers.
5. **Focus indicators** — Verify `:focus-visible` outlines are present in `GlobalStyle.ts`.
6. **Language** — Verify `document.documentElement.lang` is synced to locale in `I18nContext.tsx`.
7. **Skip link** — Verify skip-to-content link exists in `Layout.tsx`.
8. **Images** — All `<img>` tags have meaningful `alt` text.

Report findings with file paths and line numbers, grouped by severity.
