import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/payment.controller.js'

const router = Router()

// Public — which methods the checkout should offer
router.get('/methods', ctrl.getPaymentMethods)

// Stripe card checkout (redirect flow) + webhook
router.post('/stripe/checkout/:orderId', authenticate, ctrl.createStripeCheckout)
router.post('/stripe/webhook', ctrl.stripeWebhook)

router.post('/create-safepay-session/:orderId', authenticate, ctrl.createSafepaySession)
router.post('/safepay-webhook', ctrl.safepayWebhook)
router.get('/safepay-success', ctrl.safepaySuccess)
router.get('/safepay-cancel', ctrl.safepayCancel)

export { router }
