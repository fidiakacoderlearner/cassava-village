import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import { I18nProvider } from './context/I18nContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { AudioProvider } from './context/AudioContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <ProgressProvider>
            <AudioProvider>
              <App />
            </AudioProvider>
          </ProgressProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
);
