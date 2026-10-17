import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App'

// Anonymous sign-in starts right away but in its own chunk, so the Firebase SDK does not delay
// first paint. Public catalogue reads do not wait for it.
void import('./lib/auth').then(({ ensureAnonymousUser }) => ensureAnonymousUser())

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
