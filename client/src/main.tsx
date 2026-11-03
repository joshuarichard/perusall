import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { store } from './app/store';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { App } from './App';

// Provider makes the Redux store available to all components.
// ThemeProvider makes our design tokens available to all styled-components.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
