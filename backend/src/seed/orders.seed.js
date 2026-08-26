import { Order } from '../models/Order.js'
import { sampleAddresses } from './users.seed.js'
import crypto from 'crypto'

function createOrderNumber(createdAt) {
  const date = createdAt.toISOString().slice(0, 10).replaceAll('-', '')
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `EX-${date}-${rand}`
}

/**
 * Deterministic pseudo-random generator (mulberry32) so every seed run
 * produces the same spread of orders — keeps demo data stable.
 */
function mulberry32(seed) {
  let a = seed >>> 0
  return function rand() {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled']
const PAYMENT_METHODS = ['card', 'cod', 'safepay']
const TRACKING_PREFIXES = ['EX', 'SF', 'DHL', 'TCS']

function pick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)]
}

/**
 * Build ~`count` orders across the last `daysSpan` days, spread over the
 * given customers and products. Prices are snapshotted from current product
 * prices (stock is NOT decremented — seed writes historical orders directly).
 *
 * @param {object[]} customers  customer User docs (role === 'customer')
 * @param {object[]} products   Product docs (must have .price)
 * @param {number}   count      number of orders to generate
 * @returns {Promise<object[]>} created Order docs
 */
export async function generateOrders(customers, products, count = 60) {
  const rand = mulberry32(20260805)
  const now = Date.now()
  const daysSpan = 90
  const docs = []

  // Weight customers so a few become clear "top spenders" on the leaderboard.
  const weightedCustomers = []
  customers.forEach((c, i) => {
    // First customer gets the most orders, then decreasing.
    const weight = Math.max(1, Math.round((customers.length - i) * 1.5))
    for (let w = 0; w < weight; w++) weightedCustomers.push(c)
  })

  for (let i = 0; i < count; i++) {
    const customer = pick(rand, weightedCustomers)
    // 1–4 line items per order
    const itemCount = 1 + Math.floor(rand() * 4)
    const usedProductIds = new Set()
    const items = []
    let totalAmount = 0

    for (let j = 0; j < itemCount; j++) {
      let product = pick(rand, products)
      let guard = 0
      while (usedProductIds.has(String(product._id)) && guard++ < 5) {
        product = pick(rand, products)
      }
      usedProductIds.add(String(product._id))

      const quantity = 1 + Math.floor(rand() * 3)
      const price = product.price
      totalAmount += price * quantity
      items.push({ product: product._id, quantity, price })
    }

    // Spread createdAt across the last `daysSpan` days (newest-weighted).
    const daysAgo = Math.floor(rand() * daysSpan)
    const hoursAgo = Math.floor(rand() * 24)
    const createdAt = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000)

    const status = pick(rand, STATUSES)
    const paymentMethod = pick(rand, PAYMENT_METHODS)

    // Payment status tracks order lifecycle.
    let paymentStatus = 'pending'
    if (status === 'delivered') paymentStatus = 'paid'
    else if (status === 'cancelled') paymentStatus = rand() > 0.5 ? 'refunded' : 'failed'
    else if (status === 'shipped' || status === 'processing') paymentStatus = rand() > 0.3 ? 'paid' : 'pending'

    // Build a plausible status history timeline from creation → current status.
    const flow = ['pending']
    if (['processing', 'shipped', 'delivered'].includes(status)) flow.push('processing')
    if (['shipped', 'delivered'].includes(status)) flow.push('shipped')
    if (status === 'delivered') flow.push('delivered')
    if (status === 'cancelled') flow.push('cancelled')

    const statusHistory = flow.map((s, idx) => ({
      status: s,
      timestamp: new Date(createdAt.getTime() + idx * 6 * 3600000),
      note: idx === 0 ? 'Order created' : `Status updated to ${s}`,
    }))

    const address = pick(rand, sampleAddresses)

    const trackingNumber = ['shipped', 'delivered'].includes(status)
      ? `${pick(rand, TRACKING_PREFIXES)}${Math.floor(rand() * 9_000_000_000) + 1_000_000_000}`
      : undefined

    const estimatedDelivery = ['shipped', 'delivered'].includes(status)
      ? new Date(createdAt.getTime() + 4 * 86400000)
      : undefined

    docs.push({
      user: customer._id,
      orderNumber: createOrderNumber(createdAt),
      items,
      totalAmount,
      status,
      shippingAddress: address,
      paymentMethod,
      paymentStatus,
      trackingNumber,
      estimatedDelivery,
      statusHistory,
      createdAt,
      updatedAt: statusHistory[statusHistory.length - 1].timestamp,
    })
  }

  // Sort newest first so they read naturally.
  docs.sort((a, b) => b.createdAt - a.createdAt)
  const inserted = await Order.insertMany(docs)
  return inserted
}
