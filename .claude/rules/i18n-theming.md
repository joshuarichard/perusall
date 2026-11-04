---
description: Internationalization and theming rules
globs: client/src/i18n/**,client/src/styles/**,client/src/components/**
---

# i18n & Theming

## Internationalization
- All user-facing strings go through `useTranslation` hook's `t()` function
- Translations defined in `client/src/i18n/translations.ts` for both `en` and `es`
- Interpolation: `t('key', { name: value })` → `"Hello {{name}}"`
- When adding a feature, add i18n strings for both locales
- Locale persisted in localStorage with `navigator.language` fallback

## Dark Mode
- `ThemeContext` with `useThemeMode` hook provides `mode` and `toggleTheme`
- Two theme objects: `lightTheme` and `darkTheme` in `styles/theme.ts`
- Persisted in localStorage with `prefers-color-scheme` fallback
- Button backgrounds use `buttonPrimary`/`buttonPrimaryHover` tokens — these are darker shades in dark mode to maintain 4.5:1 contrast with white text
- `primary` / `primaryHover` are lighter in dark mode for text contrast against dark surfaces

## Adding Theme Tokens
- Define in both `lightTheme` and `darkTheme` in `styles/theme.ts`
- Verify WCAG AA contrast ratios for both themes
