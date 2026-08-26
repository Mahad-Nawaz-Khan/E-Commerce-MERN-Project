import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/wishlist.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', ctrl.getMyWishlist)
router.post('/items', validate([
  body('productId').notEmpty(),
]), ctrl.toggleWishlist)
router.delete('/items/:productId', ctrl.removeWishlistItem)
router.delete('/', ctrl.clearWishlist)

export { router }
