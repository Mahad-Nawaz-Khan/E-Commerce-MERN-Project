import cors from 'cors'
import { env } from './env.js'

export const corsMiddleware = cors({
  origin(origin, cb) {
    // allow same-origin / curl (no origin) + allowlisted origins
    if (!origin || env.allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})
