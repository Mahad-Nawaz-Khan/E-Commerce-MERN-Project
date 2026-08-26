import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  publicId: { type: String, required: true, trim: true },
  resourceType: { type: String, default: 'image' },
  format: { type: String, trim: true },
  bytes: { type: Number, min: 0 },
  folder: { type: String, trim: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

mediaSchema.index({ uploadedBy: 1, createdAt: -1 })

export const Media = mongoose.model('Media', mediaSchema)
