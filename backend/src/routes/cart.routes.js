import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/cart.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', ctrl.getMyCart)
router.post('/items', validate([
  body('productId').notEmpty(),
  body('quantity').optional().isInt({ min: 1 }),
]), ctrl.addToCart)
router.put('/items/:itemId', validate([body('quantity').isInt({ min: 0 })]), ctrl.updateCartItem)
router.delete('/items/:itemId', ctrl.removeCartItem)
router.delete('/', ctrl.clearCart)

export { router }
