import { Info } from 'lucide-react'
import { useSelector } from 'react-redux'
import { ProtectedRoute } from './protected-route'

export function UserRoute({ children }) {
  const { user } = useSelector((state) => state.auth)

  return (
    <ProtectedRoute>
      {user?.role === 'admin' ? (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-4 py-2.5 text-sm text-[var(--color-warning)]">
          <Info className="h-4 w-4 shrink-0" />
          <span>You&apos;re an admin viewing the customer dashboard.</span>
        </div>
      ) : null}
      {children}
    </ProtectedRoute>
  )
}
