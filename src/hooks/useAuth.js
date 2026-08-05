import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { logout as logoutAction, useLogoutMutation } from '../features/auth'

/**
 * Auth convenience hook. Exposes the current user/token/auth-state plus a
 * `signOut` that clears the server refresh cookie, flushes local auth state,
 * and redirects to /login. Safe to call when already logged out.
 */
export function useAuth() {
  const { user, token, status } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoutServer, { isLoading }] = useLogoutMutation()

  const isAuthenticated = !!user && !!token
  const isAdmin = user?.role === 'admin'

  const signOut = useCallback(async () => {
    try {
      // Best-effort — a failed network logout still clears local state.
      await logoutServer().unwrap()
    } catch {
      /* cookie may already be gone */
    }
    dispatch(logoutAction())
    toast.success('Signed out')
    navigate('/login')
  }, [dispatch, logoutServer, navigate])

  return { user, token, status, isAuthenticated, isAdmin, signOut, isSigningOut: isLoading }
}
