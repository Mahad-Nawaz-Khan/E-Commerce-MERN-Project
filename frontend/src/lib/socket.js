import { io } from 'socket.io-client'

// VITE_API_URL points at the REST base (/api); sockets live on the origin.
const origin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

/** Singleton socket — connect/disconnect is managed by NotificationsBell. */
export const socket = io(origin, { autoConnect: false, withCredentials: true })
