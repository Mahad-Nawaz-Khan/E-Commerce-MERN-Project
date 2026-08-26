import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['order_placed', 'order_status', 'order_cancelled', 'review_posted'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  body: { type: String, trim: true },
  // Frontend route to open when the notification is clicked.
  link: { type: String, trim: true },
  isRead: { type: Boolean, default: false, index: true },
  // Set when marked read — drives the TTL index below.
  readAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

// Read notifications self-destruct 7 days after being read. MongoDB's TTL
// monitor sweeps roughly every 60s; docs without readAt never expire.
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 })

export const Notification = mongoose.model('Notification', notificationSchema)
