import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

let client = null

async function getClient() {
  if (!env.safepay.configured) return null
  if (client) return client

  const { Safepay } = await import('@sfpy/node-sdk')
  client = new Safepay({
    environment: env.safepay.environment,
    apiKey: env.safepay.apiKey,
    v1Secret: env.safepay.v1Secret,
    webhookSecret: env.safepay.webhookSecret,
  })
  return client
}

export function isPaymentConfigured() {
  return env.safepay.configured
}

/** Create a SafePay payment and checkout URL for an order. */
export async function createCheckoutSession({ orderId, amount, currency = 'PKR' }) {
  const sf = await getClient()
  if (!sf) throw ApiError.notImplemented('SafePay is not configured. Add SAFEPAY_* keys to .env.')

  const { token } = await sf.payments.create({ amount: Math.round(amount * 100), currency })
  const url = sf.checkout.create({
    token,
    orderId: String(orderId),
    redirectUrl: `${env.clientUrl}/orders/${orderId}?paid=1`,
    cancelUrl: `${env.clientUrl}/orders/${orderId}?paid=0`,
    source: 'custom',
    webhooks: true,
  })
  return { token, url }
}

export async function verifySignature(req) {
  const sf = await getClient()
  return sf ? sf.verify.signature(req) : false
}

export async function verifyWebhook(req) {
  const sf = await getClient()
  return sf ? sf.verify.webhook(req) : false
}
