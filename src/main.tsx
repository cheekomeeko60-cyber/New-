import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silence generic script errors from external widgets (TradingView, etc.)
// which are often blocked by browser extensions but benign for app functionality.
window.addEventListener('error', (e) => {
  const isGenericScriptError = e.message === 'Script error.';
  const isQuerySelectorError = e.message.includes('querySelector') && e.message.includes('null');
  
  if (isGenericScriptError || isQuerySelectorError) {
     const errorType = isGenericScriptError ? 'cross-origin' : 'DOM';
     console.warn(`Benign ${errorType} script error suppressed:`, e.message);
     e.preventDefault();
     e.stopPropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
