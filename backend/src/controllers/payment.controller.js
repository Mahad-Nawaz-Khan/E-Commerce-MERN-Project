import { env } from '../config/env.js'
import { Order } from '../models/Order.js'
import { createCheckoutSession, isPaymentConfigured, verifySignature, verifyWebhook } from '../services/payment.js'
import { isStripeConfigured, createStripeCheckoutSession, verifyStripeWebhook } from '../services/stripe.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/** Public: which payment methods this deployment can actually serve. */
export const getPaymentMethods = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      cod: true,
      // Card is always offered — without Stripe keys it records like any other
      // method (demo mode); with keys it becomes a real Stripe checkout.
      card: true,
      safepay: isPaymentConfigured(),
      stripeEnabled: isStripeConfigured(),
    },
  })
})

export const createStripeCheckout = asyncHandler(async (req, res) => {
  if (!isStripeConfigured()) throw ApiError.notImplemented('Stripe is not configured. Add STRIPE_SECRET_KEY to .env.')

  const order = await Order.findById(req.params.orderId).populate('items.product', 'name').populate('user', 'email')
  if (!order) throw ApiError.notFound('Order not found')
  if (order.user._id.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not your order')
  if (order.paymentStatus === 'paid') throw ApiError.conflict('Order already paid')

  const session = await createStripeCheckoutSession({ order, customerEmail: order.user.email })
  res.json({ success: true, data: session })
})

export const stripeWebhook = asyncHandler(async (req, res) => {
  // Signature verification needs the pristine bytes captured by the json
  // parser's verify hook — the parsed body may have been sanitized.
  const event = verifyStripeWebhook(req.rawBody, req.headers['stripe-signature'])

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.orderId
    if (orderId && session.payment_status === 'paid') {
      const order = await Order.findById(orderId)
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid'
        order.paymentMethod = 'stripe'
        order.paymentRef = session.id
        order.statusHistory.push({ status: order.status, timestamp: new Date(), note: `Payment received via Stripe (${session.id})` })
        await order.save()
      }
    }
  }

  res.json({ success: true, data: { received: true } })
})

export const createSafepaySession = asyncHandler(async (req, res) => {
  if (!isPaymentConfigured()) throw ApiError.notImplemented('SafePay not configured')

  const order = await Order.findById(req.params.orderId)
  if (!order) throw ApiError.notFound('Order not found')
  if (order.user.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not your order')
  if (order.paymentStatus === 'paid') throw ApiError.conflict('Order already paid')

  const session = await createCheckoutSession({ orderId: order._id, amount: order.totalAmount })
  res.json({ success: true, data: session })
})

export const safepayWebhook = asyncHandler(async (req, res) => {
  const valid = await verifyWebhook(req)
  if (!valid) throw ApiError.unauthorized('Invalid webhook signature')

  const trackerId = req.body?.tracker?.id
  const orderId = req.body?.metadata?.orderId
  if (orderId && trackerId) {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', paymentRef: trackerId })
  }

  res.json({ success: true, data: { received: true } })
})

// Redirect targets after SafePay checkout.
export const safepaySuccess = asyncHandler(async (req, res) => {
  if (!(await verifySignature(req))) throw ApiError.unauthorized('Invalid signature')

  const orderId = req.query.order_id
  if (orderId) await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' })
  res.redirect(`${env.clientUrl}/orders/${orderId}?paid=1`)
})

export const safepayCancel = asyncHandler(async (req, res) => {
  const orderId = req.query.order_id
  res.redirect(`${env.clientUrl}/orders/${orderId}?paid=0`)
})
