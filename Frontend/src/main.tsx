import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

if (
  window.location.protocol === 'http:' &&
  window.location.hostname !== 'localhost'
) {
  window.location.replace(
    `https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`
  );
}

import { PermissionsProvider } from './contexts/PermissionsContext'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PermissionsProvider>
          <App />
        </PermissionsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
