import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spinner } from './spinner'

export function ProtectedRoute({ children }) {
  const { user, status } = useSelector((state) => state.auth)
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <Spinner className="h-8 w-8 text-[var(--color-primary)]" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  return children
}
