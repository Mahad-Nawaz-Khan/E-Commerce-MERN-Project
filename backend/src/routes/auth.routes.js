import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import { env } from '../config/env.js'
import * as ctrl from '../controllers/auth.controller.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => env.nodeEnv === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 429, message: 'Too many auth attempts.' } },
})

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 chars'),
]
const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]
const emailRule = body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail()
const resetRules = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 chars'),
]

router.post('/register', authLimiter, validate(registerRules), ctrl.register)
router.post('/login', authLimiter, validate(loginRules), ctrl.login)
router.post('/refresh', ctrl.refresh)
router.post('/logout', authenticate, ctrl.logout)
router.get('/me', authenticate, ctrl.getMe)
router.get('/verify-email', ctrl.verifyEmail)
router.post('/forgot-password', authLimiter, validate([emailRule]), ctrl.forgotPassword)
router.post('/reset-password', authLimiter, validate(resetRules), ctrl.resetPassword)
router.post('/resend-verification', authLimiter, validate([emailRule]), ctrl.resendVerification)

export { router }
