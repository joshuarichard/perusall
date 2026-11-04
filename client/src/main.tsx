import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ThemeProvider, GlobalStyle } from './styles';
import { I18nProvider } from './i18n';
import { App } from './App';

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
