import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/review.controller.js'

const router = Router()
router.get('/products/:productId/reviews', ctrl.getReviewsForProduct)
router.post('/products/:productId/reviews', authenticate, validate([
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').optional().trim(),
  body('body').optional().trim(),
]), ctrl.createReview)
router.put('/reviews/:id', authenticate, ctrl.updateReview)
router.delete('/reviews/:id', authenticate, ctrl.deleteReview)

export { router }
