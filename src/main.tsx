import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: '"IBM Plex Mono", monospace',
    // Keep htmlFontSize at 16 (default) for standard rem calculation
    // Set base fontSize for calculations
    fontSize: 12,
    // Explicitly set common variants to 12px
    body1: { fontSize: '12px' },
    body2: { fontSize: '12px' },
    subtitle1: { fontSize: '12px' },
    subtitle2: { fontSize: '12px' },
    // Adjust other variants as needed, or they'll inherit/calculate
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
