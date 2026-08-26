import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'
import { signEmailToken } from './token.js'

let transport = null
function getTransport() {
  if (process.env.NODE_ENV === 'test') {
    return null // explicitly disable live email in test environment
  }
  if (transport) return transport
  if (!env.email.user || !env.email.pass) {
    return null // email disabled in this env (logs instead)
  }
  transport = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    // Port 465 is implicit TLS (Gmail); 587 upgrades via STARTTLS.
    secure: env.email.port === 465,
    auth: { user: env.email.user, pass: env.email.pass },
  })
  return transport
}

async function send(mail) {
  const t = getTransport()
  if (!t) {
    logger.info({ to: mail.to, subject: mail.subject }, '[email:dev] (SMTP disabled / test env) — simulated email dispatch')
    return
  }
  try {
    const info = await t.sendMail({ from: env.email.from, ...mail })
    logger.info({ to: mail.to, subject: mail.subject, messageId: info.messageId }, '[email] Successfully dispatched email via SMTP')
    return info
  } catch (err) {
    logger.error({ to: mail.to, subject: mail.subject, err: err.message }, '[email] Failed to send email via SMTP')
    throw err
  }
}

export async function sendVerificationEmail(user) {
  const token = signEmailToken({ id: user._id || user.id, email: user.email })
  const url = `${env.clientUrl}/verify-email?token=${token}`
  await send({
    to: user.email,
    subject: 'Verify your Exclusive account',
    html: `<p>Welcome to Exclusive, ${user.name}.</p><p>Verify your email:</p><p><a href="${url}">${url}</a></p><p>This link expires in 24 hours.</p>`,
  })
}

export async function sendPasswordResetEmail(user, resetToken) {
  const url = `${env.clientUrl}/reset-password?token=${resetToken}`
  await send({
    to: user.email,
    subject: 'Reset your Exclusive password',
    html: `<p>We received a request to reset your password.</p><p><a href="${url}">${url}</a></p><p>This link expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
  })
}

const ORDER_EMAIL_COPY = {
  confirmed: {
    subject: (o) => `Order ${o.orderNumber} confirmed`,
    line: (o) => `We've received your order and will start preparing it right away. Total: $${o.totalAmount.toFixed(2)}.`,
  },
  shipped: {
    subject: (o) => `Order ${o.orderNumber} is on its way`,
    line: () => `Good news — your order has shipped and is on its way to you.`,
  },
  delivered: {
    subject: (o) => `Order ${o.orderNumber} delivered`,
    line: () => `Your order has been delivered. Enjoy! If anything isn't right, our support team is here to help.`,
  },
  cancelled: {
    subject: (o) => `Order ${o.orderNumber} cancelled`,
    line: () => `Your order has been cancelled and any reserved stock has been returned. If you didn't request this, please contact our support team.`,
  },
}

/** Transactional order email — kind: 'confirmed' | 'shipped' | 'delivered' | 'cancelled'. */
export async function sendOrderEmail(order, user, kind) {
  const copy = ORDER_EMAIL_COPY[kind]
  if (!copy) return
  const url = `${env.clientUrl}/account/orders/${order.orderNumber}`
  await send({
    to: user.email,
    subject: copy.subject(order),
    html: `<p>Hi ${user.name},</p><p>${copy.line(order)}</p><p><a href="${url}">View your order</a></p><p>Exclusive — premium tech & lifestyle.</p>`,
  })
}

