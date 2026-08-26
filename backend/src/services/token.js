import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export function signAccessToken(user) {
  return jwt.sign({ id: user._id || user.id, role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiry,
  })
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user._id || user.id, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  })
}

export function signEmailToken(payload) {
  return jwt.sign(payload, env.jwt.emailSecret, { expiresIn: '24h' })
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret)
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token')
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.jwt.refreshSecret)
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token')
  }
}

export function verifyEmailToken(token) {
  try {
    return jwt.verify(token, env.jwt.emailSecret)
  } catch {
    throw ApiError.unauthorized('Invalid or expired email token')
  }
}

/** Hash a refresh token before storing on the user. */
export async function hashRefreshToken(token) {
  return bcrypt.hash(token, 12)
}

/** Refresh-token cookie options. */
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

export const REFRESH_COOKIE = 'refreshToken'
