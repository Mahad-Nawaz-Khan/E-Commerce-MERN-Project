import dotenv from 'dotenv'

dotenv.config()

function required(key) {
  const v = process.env[key]
  if (!v || !v.trim()) {
    throw new Error(`Missing required env var: ${key}. Copy .env.example to .env and fill it in.`)
  }
  return v.trim()
}

function secret(key, minLen = 32) {
  const v = required(key)
  if (v.length < minLen && process.env.NODE_ENV === 'production') {
    throw new Error(`${key} must be at least ${minLen} characters in production.`)
  }
  if (v.startsWith('change-me')) {
    console.warn(`[env] WARNING: ${key} is still a placeholder. Set a real secret before deploying.`)
  }
  return v
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: required('MONGO_URI'),
  jwt: {
    accessSecret: secret('JWT_ACCESS_SECRET'),
    refreshSecret: secret('JWT_REFRESH_SECRET'),
    emailSecret: secret('JWT_EMAIL_SECRET'),
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
  allowedOrigins: (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map((s) => s.trim()).filter(Boolean),
  email: {
    host: process.env.EMAIL_HOST || '',
    port: Number(process.env.EMAIL_PORT) || 2525,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'Exclusive <no-reply@exclusive.test>',
  },
  safepay: {
    environment: process.env.SAFEPAY_ENVIRONMENT || 'sandbox',
    apiKey: process.env.SAFEPAY_API_KEY || '',
    v1Secret: process.env.SAFEPAY_V1_SECRET || '',
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || '',
    configured: !!(process.env.SAFEPAY_API_KEY && process.env.SAFEPAY_V1_SECRET),
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.STRIPE_CURRENCY || 'usd',
    configured: !!process.env.STRIPE_SECRET_KEY,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'exclusive-ecommerce',
    configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
  },
})
