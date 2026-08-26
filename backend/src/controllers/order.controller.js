import mongoose from 'mongoose'
import crypto from 'crypto'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Cart } from '../models/Cart.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { notifyOrderEvent } from '../services/notification.js'

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `EX-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

function findOrderByReference(reference) {
  const criteria = [{ orderNumber: String(reference) }]
  if (mongoose.isObjectIdOrHexString(reference)) criteria.push({ _id: reference })
  return Order.findOne({ $or: criteria })
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body
  if (!Array.isArray(items) || items.length === 0) throw ApiError.badRequest('Order must include items')

  const session = await mongoose.startSession()
  let order
  try {
    await session.withTransaction(async () => {
      // Validate every item + snapshot price + decrement stock atomically.
      const lineItems = []
      let totalAmount = 0
      for (const it of items) {
        const product = it.product
          ? await Product.findById(it.product).session(session)
          : await Product.findOne({ slug: it.productSlug }).session(session)
        if (!product || !product.isActive) throw ApiError.notFound(`Product not found: ${it.productSlug || it.product}`)
        const qty = Number(it.quantity)
        if (!Number.isInteger(qty) || qty < 1) throw ApiError.badRequest('Each item quantity must be a whole number of at least 1')
        if (product.stock < qty) throw ApiError.conflict(`Insufficient stock for ${product.name}`)

        // Atomic conditional decrement (fails if stock dropped mid-flight).
        const updated = await Product.updateOne(
          { _id: product._id, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { session },
        )
        if (updated.modifiedCount !== 1) throw ApiError.conflict(`Stock changed for ${product.name}, retry`)

        lineItems.push({ product: product._id, quantity: qty, price: product.price })
        totalAmount += product.price * qty
      }
      order = await Order.create([{
        user: req.user._id, items: lineItems, totalAmount, orderNumber: createOrderNumber(),
        shippingAddress, paymentMethod,
      }], { session })
      order = order[0]
    })
  } finally {
    session.endSession()
  }

  // Clear the user's cart on success.
  await Cart.updateOne({ user: req.user._id }, { items: [] })

  // Fire-and-forget: confirmation notification + email never block the order.
  void notifyOrderEvent(order, 'placed')

  res.status(201).json({ success: true, data: order })
})

export const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id }
  const orders = await Order.find(filter).populate('items.product', 'name slug images').sort('-createdAt')
  res.json({ success: true, data: orders })
})

export const getOrder = asyncHandler(async (req, res) => {
  const order = await findOrderByReference(req.params.id).populate('items.product', 'name slug images')
  if (!order) throw ApiError.notFound('Order not found')
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not your order')
  }
  res.json({ success: true, data: order })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus, trackingNumber, estimatedDelivery, note } = req.body
  const order = await findOrderByReference(req.params.id)
  if (!order) throw ApiError.notFound('Order not found')

  const statusChanged = !!status && status !== order.status
  if (status) {
    order.status = status
    if (note) {
      order.statusHistory.push({ status, timestamp: new Date(), note })
    }
  }
  if (paymentStatus) order.paymentStatus = paymentStatus
  if (trackingNumber) order.trackingNumber = trackingNumber
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery

  await order.save()
  if (statusChanged) void notifyOrderEvent(order, 'status')
  res.json({ success: true, data: order })
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await findOrderByReference(req.params.id)
  if (!order) throw ApiError.notFound('Order not found')
  
  // Check ownership
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not your order')
  }
  
  // Check if cancellable
  if (!order.canBeCancelled()) {
    throw ApiError.badRequest('Order cannot be cancelled at this stage')
  }
  
  order.status = 'cancelled'
  order.statusHistory.push({ 
    status: 'cancelled', 
    timestamp: new Date(), 
    note: req.user.role === 'admin' ? 'Cancelled by admin' : 'Cancelled by customer'
  })
  
  // Restore stock
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session }
        )
      }
      await order.save({ session })
    })
  } finally {
    session.endSession()
  }

  void notifyOrderEvent(order, 'cancelled')
  res.json({ success: true, data: order })
})

export const getOrderTracking = asyncHandler(async (req, res) => {
  const order = await findOrderByReference(req.params.id).select('status statusHistory trackingNumber estimatedDelivery user')
  if (!order) throw ApiError.notFound('Order not found')
  
  // Check ownership
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not your order')
  }
  
  res.json({ success: true, data: order })
})
