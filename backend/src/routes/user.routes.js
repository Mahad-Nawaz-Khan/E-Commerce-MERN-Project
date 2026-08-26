import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/user.controller.js'

const router = Router()
router.get('/', authenticate, authorizeRoles('admin'), ctrl.getUsers)
router.get('/:id', authenticate, ctrl.getUser)
router.put('/:id', authenticate, ctrl.updateUser)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteUser)

// Address management
router.get('/me/addresses', authenticate, ctrl.getAddresses)
router.post('/me/addresses', authenticate, validate([
  body('label').optional().isString(),
  body('street').notEmpty(),
  body('city').notEmpty(),
  body('state').optional().isString(),
  body('zip').notEmpty(),
  body('country').notEmpty(),
]), ctrl.addAddress)
router.put('/me/addresses/:addressId', authenticate, ctrl.updateAddress)
router.delete('/me/addresses/:addressId', authenticate, ctrl.deleteAddress)
router.patch('/me/addresses/:addressId/default', authenticate, ctrl.setDefaultAddress)

// Password change
router.patch('/me/change-password', authenticate, validate([
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
]), ctrl.changePassword)

// User stats
router.get('/me/stats', authenticate, ctrl.getUserStats)

export { router }
