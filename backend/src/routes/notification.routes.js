import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/notification.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', ctrl.getNotifications)
router.get('/unread-count', ctrl.getUnreadCount)
router.post('/read-all', ctrl.markAllNotificationsRead)
router.post('/:id/read', ctrl.markNotificationRead)
router.delete('/:id', ctrl.deleteNotification)

export { router }
