/**
 * @file main.tsx
 * @description Module handling main.tsx functionality for the MPL Interactive IDE.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.tsx';
import '@/index.css';
import '@/i18n';

import { AuthProvider } from '@/contexts/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
