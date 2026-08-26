import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/category.controller.js'

const router = Router()
router.get('/', ctrl.getCategories)
router.get('/tree', ctrl.getCategoryTree)
router.get('/:id', ctrl.getCategory)
router.post('/', authenticate, authorizeRoles('admin'), ctrl.createCategory)
router.put('/:id', authenticate, authorizeRoles('admin'), ctrl.updateCategory)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteCategory)

export { router }
