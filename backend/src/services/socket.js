import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'
import { verifyAccessToken } from './token.js'
import { User } from '../models/User.js'

let io = null

export function userRoom(userId) {
  return `user:${String(userId)}`
}

/**
 * Attach Socket.IO to the HTTP server. Sockets authenticate with the same
 * access token as the REST API (handshake auth), then join their personal
 * room so the server can push events to exactly one user.
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.allowedOrigins, credentials: true },
  })

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))
      const decoded = verifyAccessToken(token)
      socket.data.userId = decoded.id
      next()
    } catch {
      next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket) => {
    const { userId } = socket.data
    // Reload the user so deleted/deactivated accounts can't hold a socket.
    User.exists({ _id: userId })
      .then((exists) => {
        if (!exists) {
          socket.disconnect(true)
          return
        }
        socket.join(userRoom(userId))
        logger.info({ userId }, '[socket] connected')
      })
      .catch(() => socket.disconnect(true))

    socket.on('disconnect', () => {
      logger.info({ userId }, '[socket] disconnected')
    })
  })

  return io
}

export function getIO() {
  return io
}

/** Push an event to one user's room. Safe no-op when no server/socket is attached. */
export function emitToUser(userId, event, payload) {
  if (!io) return
  io.to(userRoom(userId)).emit(event, payload)
}
