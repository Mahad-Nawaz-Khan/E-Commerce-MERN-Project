import Stripe from 'stripe'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

let client = null

function getClient() {
  if (!env.stripe.configured) return null
  if (!client) client = new Stripe(env.stripe.secretKey)
  return client
}

export function isStripeConfigured() {
  return env.stripe.configured
}

/**
 * Stripe Checkout session for an existing order. Line items mirror the order
 * exactly (name × qty × unit price) so the charged total matches
 * order.totalAmount; the order id rides along in metadata for the webhook.
 */
export async function createStripeCheckoutSession({ order, customerEmail }) {
  const stripe = getClient()
  if (!stripe) throw ApiError.notImplemented('Stripe is not configured. Add STRIPE_SECRET_KEY to .env.')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: order.items.map((item) => ({
      price_data: {
        currency: env.stripe.currency,
        product_data: { name: item.product?.name || 'Item' },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: { orderId: String(order._id) },
    success_url: `${env.clientUrl}/account/orders/${order.orderNumber}?paid=1`,
    cancel_url: `${env.clientUrl}/account/orders/${order.orderNumber}?paid=0`,
  })
  return { id: session.id, url: session.url }
}

/** Verifies the Stripe-Signature header against the raw request body. */
export function verifyStripeWebhook(rawBody, signature) {
  const stripe = getClient()
  if (!stripe) throw ApiError.notImplemented('Stripe is not configured. Add STRIPE_SECRET_KEY to .env.')
  if (!rawBody || !signature) throw ApiError.badRequest('Missing webhook payload or signature')
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret)
  } catch {
    throw ApiError.unauthorized('Invalid webhook signature')
  }
}
