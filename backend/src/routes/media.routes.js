import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import { uploadSingle, uploadMultiple } from '../middleware/upload.js'
import * as ctrl from '../controllers/media.controller.js'

const router = Router()
router.use(authenticate, authorizeRoles('admin'))
router.post('/', uploadSingle('file'), ctrl.uploadMedia)
router.post('/multiple', uploadMultiple('files', 5), ctrl.uploadMultipleMedia)
router.get('/', ctrl.getMedia)
router.delete('/:id', ctrl.deleteMedia)

export { router }
