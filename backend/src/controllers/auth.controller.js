import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { PasswordReset } from '../models/PasswordReset.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, verifyEmailToken,
  hashRefreshToken, refreshCookieOptions, REFRESH_COOKIE,
} from '../services/token.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js'

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions())
}
function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (await User.exists({ email })) throw ApiError.conflict('Email already registered')
  // role is NEVER accepted from the client — always customer on self-register.
  const user = await User.create({ name, email, password, role: 'customer' })
  sendVerificationEmail(user).catch((e) => console.error('[email]', e.message))
  res.status(201).json({ success: true, data: { message: 'Account created. Check your email to verify it before signing in.' } })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password')
  }
  if (!user.isEmailVerified) {
    throw ApiError.forbidden('Verify your email before signing in.')
  }
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  user.refreshTokenHash = await hashRefreshToken(refreshToken)
  user.refreshTokenId = verifyRefreshToken(refreshToken).jti
  await user.save()
  setRefreshCookie(res, refreshToken)
  res.json({ success: true, data: { user, accessToken } })
})

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) throw ApiError.unauthorized('No refresh token')
  const decoded = verifyRefreshToken(token)
  const user = await User.findById(decoded.id).select('+refreshTokenHash +refreshTokenId')
  if (!user || !user.refreshTokenHash || !user.refreshTokenId) {
    throw ApiError.unauthorized('Invalid refresh token')
  }
  if (!user.isEmailVerified) {
    clearRefreshCookie(res)
    throw ApiError.forbidden('Verify your email before signing in.')
  }

  // Reuse detection: the presented token must match the stored hash and id.
  const matches = decoded.jti === user.refreshTokenId && await bcrypt.compare(token, user.refreshTokenHash)
  if (!matches) {
    // Stolen-token scenario — revoke the whole family.
    user.refreshTokenHash = null
    user.refreshTokenId = null
    await user.save()
    clearRefreshCookie(res)
    throw ApiError.unauthorized('Refresh token reuse detected — please log in again')
  }

  // Rotate. The refresh token carries a unique id, preventing identical same-second JWTs.
  const newRefresh = signRefreshToken(user)
  user.refreshTokenHash = await hashRefreshToken(newRefresh)
  user.refreshTokenId = verifyRefreshToken(newRefresh).jti
  await user.save()
  setRefreshCookie(res, newRefresh)
  res.json({ success: true, data: { accessToken: signAccessToken(user) } })
})

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshTokenHash = null
    req.user.refreshTokenId = null
    await req.user.save()
  }
  clearRefreshCookie(res)
  res.json({ success: true, data: { message: 'Logged out' } })
})

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query
  if (!token) throw ApiError.badRequest('Missing verification token')
  const decoded = verifyEmailToken(token)
  const user = await User.findById(decoded.id)
  if (!user) throw ApiError.notFound('User not found')
  if (!user.isEmailVerified) {
    user.isEmailVerified = true
    await user.save()
  }
  res.json({ success: true, data: { message: 'Email verified' } })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email: String(email).toLowerCase() })
  // Always 200 — don't leak which emails exist.
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex')
    const tokenHash = await bcrypt.hash(raw, 12)
    await PasswordReset.create({ user: user._id, tokenHash, expiresAt: Date.now() + 10 * 60 * 1000 })
    sendPasswordResetEmail(user, raw).catch((e) => console.error('[email]', e.message))
  }
  res.json({ success: true, data: { message: 'If that email exists, a reset link has been sent.' } })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) throw ApiError.badRequest('Token and password are required')
  const candidates = await PasswordReset.find({ used: false, expiresAt: { $gt: Date.now() } })
  let match = null
  for (const c of candidates) {
    if (await bcrypt.compare(token, c.tokenHash)) { match = c; break }
  }
  if (!match) throw ApiError.badRequest('Invalid or expired reset token')
  const user = await User.findById(match.user).select('+password')
  user.password = password
  user.refreshTokenHash = null // force re-login everywhere
  user.refreshTokenId = null
  await user.save()
  match.used = true
  await match.save()
  res.json({ success: true, data: { message: 'Password reset — please log in.' } })
})
