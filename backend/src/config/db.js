import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
  return mongoose.connection
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
