import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { cloudinary, assertCloudinaryConfigured } from '../config/cloudinary.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: env.cloudinary.folder,
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
})

function fileFilter(_req, file, cb) {
  if (file.mimetype.startsWith('image/')) return cb(null, true)
  cb(new ApiError(400, 'Only image files are allowed'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })

// Each helper is a middleware chain: config guard first, then Multer, so an
// unconfigured deployment rejects uploads with a clear 503 before any I/O.
function guardConfigured(_req, _res, next) {
  try {
    assertCloudinaryConfigured()
    next()
  } catch (err) {
    next(err)
  }
}

export const uploadSingle = (field) => [guardConfigured, upload.single(field)]
export const uploadMultiple = (field, max = 5) => [guardConfigured, upload.array(field, max)]
