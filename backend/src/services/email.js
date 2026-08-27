import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'
import { signEmailToken } from './token.js'

// ─── SMTP Transport (singleton) ───────────────────────────────────────────────

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

// ─── Send helper ──────────────────────────────────────────────────────────────

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
    logger.error({ to: mail.to, subject: mail.subject, err: err.message, stack: err.stack }, '[email] Failed to send email via SMTP')
    // Don't re-throw — callers use fire-and-forget; a failed email must never
    // crash the request that triggered it.
  }
}

// ─── Branded Email Layout ─────────────────────────────────────────────────────

const BRAND = {
  name: 'Exclusive',
  tagline: 'Premium Tech & Lifestyle',
  color: {
    bg: '#0f0f1a',
    header: '#1a1a2e',
    accent: '#e94560',
    accentHover: '#d63a56',
    card: '#ffffff',
    text: '#2d2d3a',
    muted: '#6b7280',
    border: '#e5e7eb',
    footerBg: '#f9fafb',
  },
}

/**
 * Wraps content in a professional, responsive branded email layout.
 * All styles are inline for maximum email-client compatibility.
 */
function layout({ preheader, heading, body, cta, footer }) {
  const ctaBlock = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
        <tr>
          <td style="border-radius:8px;background:${BRAND.color.accent};">
            <a href="${cta.url}" target="_blank"
               style="display:inline-block;padding:14px 36px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                      font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;
                      letter-spacing:0.3px;">
              ${cta.label}
            </a>
          </td>
        </tr>
      </table>`
    : ''

  const footerText = footer || `You're receiving this because you have an account with ${BRAND.name}.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${heading}</title>
  <!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background:${BRAND.color.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.color.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND.color.header};padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:1.5px;">
                ${BRAND.name.toUpperCase()}
              </h1>
              <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;">
                ${BRAND.tagline}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:${BRAND.color.card};padding:36px 32px 28px;border-left:1px solid ${BRAND.color.border};border-right:1px solid ${BRAND.color.border};">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:${BRAND.color.text};">
                ${heading}
              </h2>
              <div style="font-size:15px;line-height:1.7;color:${BRAND.color.text};">
                ${body}
              </div>
              ${ctaBlock}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${BRAND.color.footerBg};padding:24px 32px;border-radius:0 0 12px 12px;
                        border:1px solid ${BRAND.color.border};border-top:none;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.color.muted};">
                ${footerText}
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:${BRAND.color.muted};">
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Account Verification ─────────────────────────────────────────────────────

export async function sendVerificationEmail(user) {
  const token = signEmailToken({ id: user._id || user.id, email: user.email })
  const url = `${env.clientUrl}/verify-email?token=${token}`
  await send({
    to: user.email,
    subject: `Verify your ${BRAND.name} account`,
    html: layout({
      preheader: `Welcome to ${BRAND.name} — verify your email to get started.`,
      heading: `Welcome, ${user.name}!`,
      body: `
        <p style="margin:0 0 12px;">Thanks for creating your ${BRAND.name} account. To start shopping, please verify your email address by clicking the button below.</p>
        <p style="margin:0;color:${BRAND.color.muted};font-size:13px;">This link expires in <strong>24 hours</strong>.</p>
      `,
      cta: { url, label: 'Verify Email Address' },
      footer: `If you didn't create this account, you can safely ignore this email.`,
    }),
  })
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(user, resetToken) {
  const url = `${env.clientUrl}/reset-password?token=${resetToken}`
  await send({
    to: user.email,
    subject: `Reset your ${BRAND.name} password`,
    html: layout({
      preheader: 'A password reset was requested for your account.',
      heading: 'Password Reset Request',
      body: `
        <p style="margin:0 0 12px;">Hi ${user.name},</p>
        <p style="margin:0 0 12px;">We received a request to reset your password. Click the button below to choose a new one.</p>
        <p style="margin:0;color:${BRAND.color.muted};font-size:13px;">This link expires in <strong>10 minutes</strong>. If you didn't request this, no action is needed — your password is still safe.</p>
      `,
      cta: { url, label: 'Reset Password' },
    }),
  })
}

// ─── Order Emails ─────────────────────────────────────────────────────────────

const ORDER_EMAIL_COPY = {
  confirmed: {
    subject: (o) => `Order ${o.orderNumber} confirmed`,
    heading: (o) => `Order Confirmed — ${o.orderNumber}`,
    preheader: (o) => `We've received your order (${o.orderNumber}).`,
    body: (o) => `
      <p style="margin:0 0 12px;">Great news — your order has been confirmed and we're preparing it now.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 16px;background:#f3f4f6;border-radius:8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
              <tr>
                <td style="font-size:13px;color:${BRAND.color.muted};padding-bottom:4px;">Order Number</td>
                <td align="right" style="font-size:13px;color:${BRAND.color.muted};padding-bottom:4px;">Total</td>
              </tr>
              <tr>
                <td style="font-size:15px;font-weight:600;color:${BRAND.color.text};">${o.orderNumber}</td>
                <td align="right" style="font-size:15px;font-weight:600;color:${BRAND.color.accent};">$${o.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  shipped: {
    subject: (o) => `Order ${o.orderNumber} is on its way`,
    heading: (o) => `Order Shipped — ${o.orderNumber}`,
    preheader: (o) => `Your order (${o.orderNumber}) has shipped!`,
    body: () => `
      <p style="margin:0 0 12px;">Your order has been shipped and is on its way to you. You can track the delivery from your account.</p>
    `,
  },
  delivered: {
    subject: (o) => `Order ${o.orderNumber} delivered`,
    heading: (o) => `Order Delivered — ${o.orderNumber}`,
    preheader: (o) => `Your order (${o.orderNumber}) has been delivered.`,
    body: () => `
      <p style="margin:0 0 12px;">Your order has been delivered — we hope you love it!</p>
      <p style="margin:0;color:${BRAND.color.muted};font-size:13px;">If anything isn't right, our support team is here to help.</p>
    `,
  },
  cancelled: {
    subject: (o) => `Order ${o.orderNumber} cancelled`,
    heading: (o) => `Order Cancelled — ${o.orderNumber}`,
    preheader: (o) => `Your order (${o.orderNumber}) has been cancelled.`,
    body: () => `
      <p style="margin:0 0 12px;">Your order has been cancelled and any reserved stock has been returned.</p>
      <p style="margin:0;color:${BRAND.color.muted};font-size:13px;">If you didn't request this, please contact our support team immediately.</p>
    `,
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
    html: layout({
      preheader: copy.preheader(order),
      heading: copy.heading(order),
      body: `
        <p style="margin:0 0 4px;">Hi ${user.name},</p>
        ${copy.body(order)}
      `,
      cta: { url, label: 'View Order Details' },
    }),
  })
}
