import http from 'http'
import { app } from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { logger } from './utils/logger.js'
import { initSocket, getIO } from './services/socket.js'

async function start() {
  await connectDB()
  const server = http.createServer(app)
  initSocket(server)
  server.listen(env.port, () => {
    logger.info(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`)
  })
  const shutdown = (sig) => () => {
    logger.info(`[server] ${sig} received, shutting down`)
    getIO()?.close()
    server.close(() => process.exit(0))
  }
  process.on('SIGTERM', shutdown('SIGTERM'))
  process.on('SIGINT', shutdown('SIGINT'))
}

start().catch((err) => {
  logger.error({ err }, '[server] failed to start')
  process.exit(1)
})
