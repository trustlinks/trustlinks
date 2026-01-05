import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// FIXME: a custom font should be used. Eg:
// import '@fontsource-variable/<font-name>';

// Global unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser error
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
