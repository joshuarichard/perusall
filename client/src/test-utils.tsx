import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { theme } from './styles/theme';
import { I18nProvider } from './i18n';
import { api } from './app/api';
import authReducer from './features/auth/authSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Record<string, unknown>;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, route = '/', ...renderOptions }: ExtendedRenderOptions = {},
) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    preloadedState: preloadedState as any,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <I18nProvider>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </I18nProvider>
        </ThemeProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
