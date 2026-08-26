import { Media } from '../models/Media.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'
import { cloudinary } from '../config/cloudinary.js'

// Maps a Multer file delivered by CloudinaryStorage onto a Media document.
function toMediaDoc(file, userId) {
  return {
    url: file.path,
    publicId: file.filename,
    resourceType: file.resource_type ?? 'image',
    format: file.format,
    bytes: file.bytes,
    folder: file.folder,
    uploadedBy: userId,
  }
}

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded')
  const media = await Media.create(toMediaDoc(req.file, req.user._id))
  res.status(201).json({ success: true, data: media })
})

export const uploadMultipleMedia = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('No files uploaded')
  const data = await Media.insertMany(req.files.map((file) => toMediaDoc(file, req.user._id)))
  res.status(201).json({ success: true, data })
})

export const getMedia = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginateQuery(Media, req.query, {})
  res.json({ success: true, data, pagination })
})

export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id)
  if (!media) throw ApiError.notFound('Media not found')
  // Destroy the cloud asset first so a failure never orphans the document.
  await cloudinary.uploader.destroy(media.publicId)
  await media.deleteOne()
  res.json({ success: true, data: { message: 'Media deleted' } })
})
