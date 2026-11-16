import { configureStore } from '@reduxjs/toolkit';
import { type RenderOptions, render } from '@testing-library/react';
import { type ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { api } from './app/api';
import authReducer from './app/authSlice';
import { I18nProvider } from './i18n';
import { theme } from './styles/theme';

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
