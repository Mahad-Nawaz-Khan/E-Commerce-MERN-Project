import mongoose from 'mongoose'
import { env } from './env.js'

let cachedPromise = null

export async function connectDB(uri = env.mongoUri) {
  if (mongoose.connection.readyState >= 1) return mongoose.connection

  if (!cachedPromise) {
    mongoose.set('strictQuery', true)
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
    }).then(() => {
      console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
      return mongoose.connection
    }).catch((err) => {
      cachedPromise = null
      throw err
    })
  }

  return cachedPromise
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    cachedPromise = null
  }
}
