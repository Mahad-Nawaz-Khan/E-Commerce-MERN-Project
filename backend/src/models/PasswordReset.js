import mongoose from 'mongoose'

const passwordResetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true })

// Auto-expire old tokens via TTL index (remove 1h after expiry).
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 })

export const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema)
