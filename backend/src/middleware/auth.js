import { User } from '../models/User.js'
import { verifyAccessToken } from '../services/token.js'
import { ApiError } from '../utils/ApiError.js'

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw ApiError.unauthorized('Authentication required')
    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id)
    if (!user) throw ApiError.unauthorized('User no longer exists')
    if (!user.isEmailVerified) throw ApiError.forbidden('Verify your email before using your account.')
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'))
    }
    next()
  }
}
