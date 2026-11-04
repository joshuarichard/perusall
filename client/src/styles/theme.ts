const shared = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
    xxxl: '2rem',
  },
} as const;

export const lightTheme = {
  ...shared,
  colors: {
    primary: '#A31D1D',
    primaryHover: '#8B1818',
    primaryLight: '#FDF2F2',
    buttonPrimary: '#A31D1D',
    buttonPrimaryHover: '#8B1818',
    secondary: '#6B7280',
    success: '#047857',
    successLight: '#ECFDF5',
    error: '#DC2626',
    errorLight: '#FEF2F2',
    warning: '#F59E0B',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#6E7681',
    border: '#E5E7EB',
    borderFocus: '#A31D1D',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;

export const darkTheme = {
  ...shared,
  colors: {
    primary: '#EF7070',
    primaryHover: '#E85D5D',
    primaryLight: '#3B1515',
    buttonPrimary: '#C44848',
    buttonPrimaryHover: '#B83C3C',
    secondary: '#9CA3AF',
    success: '#34D399',
    successLight: '#052E16',
    error: '#F87171',
    errorLight: '#451A1A',
    warning: '#FBBF24',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#374151',
    borderFocus: '#EF7070',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
  },
} as const;

export const theme = lightTheme;

export type Theme = typeof lightTheme;
