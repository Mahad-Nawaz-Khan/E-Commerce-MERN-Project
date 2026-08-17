import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './store'

/** Redux -> Router -> children -> Toaster. */
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
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
