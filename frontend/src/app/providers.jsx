import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { AuthSync } from './auth-sync'
import { ErrorBoundary } from '../components/ui/error-boundary'

/** Redux -> Router -> ErrorBoundary -> children -> Toaster, with guest-state sync on login. */
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthSync />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  )
}
