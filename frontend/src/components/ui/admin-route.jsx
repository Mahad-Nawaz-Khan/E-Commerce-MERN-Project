import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ProtectedRoute } from './protected-route'

export function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth)

  return (
    <ProtectedRoute>
      {user?.role !== 'admin' ? (
        <Navigate to="/" replace />
      ) : (
        children
      )}
    </ProtectedRoute>
  )
}
