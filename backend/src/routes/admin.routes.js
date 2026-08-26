import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/admin.controller.js'

const router = Router()

// All admin routes require authentication and admin role
router.use(authenticate, authorizeRoles('admin'))

// Customer analytics
router.get('/customers/stats', ctrl.getCustomerStats)
router.get('/customers/:id/history', ctrl.getCustomerHistory)

// Sales analytics
router.get('/analytics/overview', ctrl.getSalesOverview)
router.get('/analytics/sales-trends', ctrl.getSalesTrends)

// Inventory analytics
router.get('/analytics/inventory', ctrl.getInventoryStats)

// Category analytics
router.get('/analytics/categories', ctrl.getCategoryAnalytics)

// Bulk product operations
router.patch('/products/bulk-update', validate([
  body('ids').isArray({ min: 1 }),
  body('updates').isObject(),
]), ctrl.bulkUpdateProducts)

router.delete('/products/bulk-delete', validate([
  body('ids').isArray({ min: 1 }),
  body('hard').optional().isBoolean(),
]), ctrl.bulkDeleteProducts)

// Admin product list (all products incl. inactive, paginated/filterable)
router.get('/products', ctrl.getAdminProducts)

// Admin order list (paginated, filterable)
router.get('/orders', ctrl.getAdminOrders)

// All reviews across products (paginated, filterable)
router.get('/reviews', ctrl.getAdminReviews)

// Lightweight customer count for dashboard cards
router.get('/customers/count', ctrl.getCustomerCount)

export { router }
