import { io } from 'socket.io-client'

// If VITE_SOCKET_URL is set, use it; otherwise infer from VITE_API_URL or current browser origin.
// NEVER default to localhost when running in a browser on a production domain.
const getSocketOrigin = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.startsWith('/')) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:5000'
}

/** Singleton socket — connect/disconnect is managed by NotificationsBell. */
export const socket = io(getSocketOrigin(), { autoConnect: false, withCredentials: true })
