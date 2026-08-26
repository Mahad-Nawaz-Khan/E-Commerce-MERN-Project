import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'
import { ApiError } from '../utils/ApiError.js'

if (env.cloudinary.configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  })
}

/**
 * Uploads are Cloudinary-only by design. When credentials are missing, fail
 * loudly with 503 instead of letting Multer hand a confusing SDK error.
 */
export function assertCloudinaryConfigured() {
  if (!env.cloudinary.configured) {
    throw new ApiError(503, 'Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the backend .env.')
  }
}

export { cloudinary }
