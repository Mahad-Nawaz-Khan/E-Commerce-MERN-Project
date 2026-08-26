import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/order.controller.js'

const router = Router()
router.use(authenticate)
router.post('/', validate([
  body('items').isArray({ min: 1 }).withMessage('Order must include at least one item'),
  body('items.*.product').optional().isMongoId().withMessage('Product must be a valid product id'),
  body('items.*.productSlug').optional().isString().trim().notEmpty().withMessage('Product slug is required when no product id is supplied'),
  body('items.*').custom((item) => Boolean(item?.product || item?.productSlug)).withMessage('Each item must include a product'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a whole number of at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.zip').trim().notEmpty().withMessage('ZIP / postal code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
  body('paymentMethod').optional().isIn(['card', 'cod', 'safepay', 'stripe']),
]), ctrl.createOrder)
router.get('/', ctrl.getOrders)
router.get('/:id', ctrl.getOrder)
router.get('/:id/tracking', ctrl.getOrderTracking)
router.post('/:id/cancel', ctrl.cancelOrder)
router.patch('/:id/status', authorizeRoles('admin'), validate([
  body('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
  body('trackingNumber').optional().isString(),
  body('estimatedDelivery').optional().isISO8601(),
  body('note').optional().isString(),
]), ctrl.updateOrderStatus)

export { router }
