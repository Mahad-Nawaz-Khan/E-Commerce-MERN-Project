import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/product.controller.js'

const router = Router()

const productRules = [
  body('name').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').notEmpty(),
  body('stock').optional().isInt({ min: 0 }),
]

router.get('/', ctrl.getProducts)
router.get('/homepage', ctrl.getHomepageData)
router.get('/:slug', ctrl.getProductBySlug)
router.post('/', authenticate, authorizeRoles('admin'), validate(productRules), ctrl.createProduct)
router.put('/:id', authenticate, authorizeRoles('admin'), validate(productRules), ctrl.updateProduct)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteProduct)

export { router }
