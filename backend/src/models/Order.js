import mongoose from 'mongoose'

const shippingSchema = new mongoose.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  zip: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
}, { _id: false })

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }, // snapshot at order time
}, { _id: true })

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, trim: true },
}, { _id: true })

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: {
    type: [orderItemSchema],
    validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: 'Order must have at least one item' },
  },
  // Customer-facing identifier. Set once at creation; never updated afterward.
  orderNumber: { type: String, unique: true, sparse: true, trim: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: { type: shippingSchema, required: true },
  paymentMethod: { type: String, enum: ['card', 'cod', 'safepay', 'stripe'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentRef: { type: String }, // SafePay tracker id
  trackingNumber: { type: String, trim: true },
  estimatedDelivery: { type: Date },
  statusHistory: { type: [statusHistorySchema], default: [] },
}, { timestamps: true })

orderSchema.index({ user: 1, createdAt: -1 })

// Add initial status to history on creation
orderSchema.pre('save', function addInitialStatus() {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, timestamp: new Date(), note: 'Order created' })
  }
})

// Add status change to history
orderSchema.pre('save', function trackStatusChange() {
  if (!this.isNew && this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() })
  }
})

orderSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  return obj
}

orderSchema.methods.canBeCancelled = function canBeCancelled() {
  return ['pending', 'processing'].includes(this.status)
}

export const Order = mongoose.model('Order', orderSchema)
