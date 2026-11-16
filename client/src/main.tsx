import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { App } from './App';
import { store } from './app/store';
import { I18nProvider } from './i18n';
import { GlobalStyle, ThemeProvider } from './styles';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <I18nProvider>
          <GlobalStyle />
          <App />
        </I18nProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
