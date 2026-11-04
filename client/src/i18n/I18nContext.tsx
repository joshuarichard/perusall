import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { translations, type Locale } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export const useTranslation = () => useContext(I18nContext);

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem('locale');
    if (stored === 'en' || stored === 'es') return stored;
  } catch {
    // localStorage unavailable
  }
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem('locale', next);
    } catch {
      // localStorage unavailable
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let value = translations[locale][key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{{${k}}}`, String(v));
        }
      }
      return value;
    },
    [locale],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}
