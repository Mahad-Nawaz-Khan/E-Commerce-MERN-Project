import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'
import { logger } from '../utils/logger.js'
import { sendOrderEmail } from './email.js'
import { emitToUser } from './socket.js'

/** Persist a notification and push it to the recipient in real time. */
async function deliver(notification) {
  await Notification.create(notification)
  emitToUser(notification.user, 'notification:new', notification)
}

/**
 * Notification orchestration. Every helper is fire-and-forget safe: a failed
 * notification or email must never fail (or slow down) the request that
 * triggered it, so all errors are logged and swallowed here.
 */
async function safe(fn, label) {
  try {
    await fn()
  } catch (err) {
    logger.warn({ err: err.message, stack: err.stack }, `notification:${label} failed`)
  }
}

function orderLink(order) {
  return `/account/orders/${order.orderNumber}`
}

function statusVerb(status) {
  return ({ shipped: 'on its way', delivered: 'delivered', cancelled: 'cancelled' })[status] || `updated to ${status}`
}

/** Customer-facing: in-app row + transactional email for key order events. */
export function notifyOrderEvent(order, event) {
  return safe(async () => {
    const user = (order.user && order.user.email)
      ? order.user
      : await User.findById(order.user?._id || order.user).select('name email')
    if (!user) {
      logger.warn({ orderId: order._id, user: order.user }, `[notification] Recipient user not found for order event: ${event}`)
      return
    }

    if (event === 'placed') {
      await deliver({
        user: user._id,
        type: 'order_placed',
        title: `Order ${order.orderNumber} confirmed`,
        body: `Thanks for your order — we received $${order.totalAmount.toFixed(2)}.`,
        link: orderLink(order),
        metadata: { orderId: order._id },
      })
      await sendOrderEmail(order, user, 'confirmed')
    } else if (event === 'status') {
      await deliver({
        user: user._id,
        type: 'order_status',
        title: `Order ${order.orderNumber} ${statusVerb(order.status)}`,
        body: `Your order status changed to ${order.status}.`,
        link: orderLink(order),
        metadata: { orderId: order._id, status: order.status },
      })
      if (order.status === 'shipped' || order.status === 'delivered') {
        await sendOrderEmail(order, user, order.status)
      }
    } else if (event === 'cancelled') {
      await deliver({
        user: user._id,
        type: 'order_cancelled',
        title: `Order ${order.orderNumber} cancelled`,
        body: 'Your order was cancelled and any reserved stock has been returned.',
        link: orderLink(order),
        metadata: { orderId: order._id },
      })
      await sendOrderEmail(order, user, 'cancelled')
    }
  }, `order:${event}`)
}

/** Admin-facing: a customer left a review on a product. */
export function notifyAdminsOfReview(review, product) {
  return safe(async () => {
    const admins = await User.find({ role: 'admin' }).select('_id')
    if (admins.length === 0) return
    for (const admin of admins) {
      await deliver({
        user: admin._id,
        type: 'review_posted',
        title: `New ${review.rating}★ review on ${product.name}`,
        body: review.title || review.body?.slice(0, 120) || 'No comment left.',
        link: '/admin/reviews',
        metadata: { reviewId: review._id, productId: product._id, rating: review.rating },
      })
    }
  }, 'review')
}
