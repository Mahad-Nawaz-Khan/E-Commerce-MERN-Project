import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { xss } from 'express-xss-sanitizer'
import pinoHttp from 'pino-http'
import { corsMiddleware } from './config/cors.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'
import { notFound, errorHandler } from './middleware/error.js'
import { router as apiRouter } from './routes/index.js'

const app = express()

// Express 5 defaults to the 'simple' parser, which flattens bracketed params
// (price[gte]=100) into literal keys — the filter operators in queryService
// need the nested shape only 'extended' produces.
app.set('query parser', 'extended')

app.disable('x-powered-by')
app.use(helmet())
app.use(pinoHttp({ logger }))
app.use(corsMiddleware)
// Stash the pristine bytes — the Stripe webhook verifies signatures against
// the exact raw body, which the sanitizer may have already rewritten.
app.use(express.json({ limit: '1mb', verify: (req, _res, buf) => { req.rawBody = buf } }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(xss())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => env.nodeEnv === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 429, message: 'Too many requests, slow down.' } },
})
app.use('/api', limiter)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.nodeEnv, time: new Date().toISOString() } })
})

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)

export { app }
