import crypto from 'crypto'
import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { User } from '../src/models/User.js'

let emailSequence = 0

async function accessToken() {
  emailSequence += 1
  const email = `pay-${emailSequence}@example.test`
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Pay Test User', email, password: 'pass1234' })
  expect(response.status).toBe(201)
  await User.updateOne({ email }, { isEmailVerified: true })
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(login.status).toBe(200)
  return login.body.data.accessToken
}

async function placeOrder(token) {
  const category = await Category.create({ name: `Pay Category ${emailSequence}` })
  const product = await Product.create({
    name: `Pay Product ${emailSequence}`,
    description: 'Product used to test stripe webhook.',
    price: 40,
    category: category._id,
    stock: 5,
    isActive: true,
  })
  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      items: [{ product: product.id, quantity: 2 }],
      shippingAddress: { street: '1 Main St', city: 'Karachi', zip: '74000', country: 'Pakistan' },
      paymentMethod: 'stripe',
    })
  expect(response.status).toBe(201)
  return response.body.data
}

// Hand-signs a Stripe webhook payload exactly like the real service does:
// v1 = HMAC-SHA256(secret, `${timestamp}.${payload}`).
function signedWebhookHeaders(payload) {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto
    .createHmac('sha256', 'whsec_testsecret')
    .update(`${timestamp}.${payload}`)
    .digest('hex')
  return { 'content-type': 'application/json', 'stripe-signature': `t=${timestamp},v1=${signature}` }
}

describe('payments', () => {
  it('advertises the methods this deployment can serve', async () => {
    const response = await request(app).get('/api/payments/methods')
    expect(response.status).toBe(200)
    // Test env carries fake Stripe keys → stripeEnabled true; card is always offered.
    expect(response.body.data).toEqual({ cod: true, card: true, safepay: false, stripeEnabled: true })
  })

  it('rejects webhook payloads without a signature', async () => {
    const response = await request(app)
      .post('/api/payments/stripe/webhook')
      .set('content-type', 'application/json')
      .send({ type: 'checkout.session.completed' })
    expect(response.status).toBe(400)
  })

  it('rejects webhook payloads with a tampered signature', async () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: {} } })
    const timestamp = Math.floor(Date.now() / 1000)
    const response = await request(app)
      .post('/api/payments/stripe/webhook')
      .set('content-type', 'application/json')
      .set('stripe-signature', `t=${timestamp},v1=${'0'.repeat(64)}`)
      .send(payload)
    expect(response.status).toBe(401)
  })

  it('marks an order paid when a correctly signed checkout.session.completed arrives', async () => {
    const token = await accessToken()
    const order = await placeOrder(token)

    const payload = JSON.stringify({
      id: 'evt_test_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_session_1', payment_status: 'paid', metadata: { orderId: order.id } } },
    })
    const response = await request(app)
      .post('/api/payments/stripe/webhook')
      .set(signedWebhookHeaders(payload))
      .send(payload)
    expect(response.status).toBe(200)

    const fetched = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(fetched.body.data).toMatchObject({ paymentStatus: 'paid', paymentMethod: 'stripe' })
    expect(fetched.body.data.paymentRef).toBeTruthy()
  })

  it('is idempotent — a replayed webhook does not double-apply', async () => {
    const token = await accessToken()
    const order = await placeOrder(token)

    const payload = JSON.stringify({
      id: 'evt_test_2',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_session_2', payment_status: 'paid', metadata: { orderId: order.id } } },
    })
    const headers = signedWebhookHeaders(payload)
    await request(app).post('/api/payments/stripe/webhook').set(headers).send(payload)
    await request(app).post('/api/payments/stripe/webhook').set(headers).send(payload)

    const fetched = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`)
    const history = fetched.body.data.statusHistory.filter((h) => /Stripe/.test(h.note || ''))
    expect(history).toHaveLength(1)
  })
})
