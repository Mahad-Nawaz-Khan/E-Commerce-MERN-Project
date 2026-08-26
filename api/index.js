import { app } from '../backend/src/app.js'
import { connectDB } from '../backend/src/config/db.js'

let isConnected = false

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await connectDB()
      isConnected = true
    }
  } catch (err) {
    console.error('[vercel:db] MongoDB connection error:', err.message)
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: `Database connection error: ${err.message}. Ensure MONGO_URI is set in Vercel and 0.0.0.0/0 is allowlisted in MongoDB Atlas Network Access.`,
      },
    })
  }
  return app(req, res)
}
