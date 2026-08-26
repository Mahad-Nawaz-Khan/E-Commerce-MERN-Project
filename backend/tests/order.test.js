import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Cart } from '../src/models/Cart.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { User } from '../src/models/User.js'

let emailSequence = 0

function uniqueEmail() {
  emailSequence += 1
  return `order-${emailSequence}@example.test`
}

async function authenticatedUser() {
  const email = uniqueEmail()
  await request(app).post('/api/auth/register').send({ name: 'Order Test User', email, password: 'pass1234' })
  await User.updateOne({ email }, { isEmailVerified: true })
  const response = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(response.status).toBe(200)
  return { token: response.body.data.accessToken, userId: response.body.data.user.id }
}

async function activeProduct({ stock } = {}) {
  const category = await Category.create({ name: `Order Category ${emailSequence}` })
  return Product.create({
    name: `Order Product ${emailSequence}`,
    description: 'Product used to test order stock transactions.',
    price: 30,
    category: category._id,
    stock,
    isActive: true,
  })
}

function orderPayload(productId, quantity) {
  return {
    items: [{ product: productId, quantity }],
    totalAmount: 1,
    shippingAddress: {
      street: '123 Test Street',
      city: 'Karachi',
      state: 'Sindh',
      zip: '75500',
      country: 'Pakistan',
    },
    paymentMethod: 'cod',
  }
}

describe('orders', () => {
  it('computes totals from product prices, decrements stock atomically, and clears the cart', async () => {
    const { token, userId } = await authenticatedUser()
    const product = await activeProduct({ stock: 5 })
    await Cart.create({ user: userId, items: [{ product: product._id, quantity: 2 }] })

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(product.id, 2))

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      totalAmount: 60,
      paymentMethod: 'cod',
      items: [{ product: product.id, quantity: 2, price: 30 }],
    })
    await expect(Product.findById(product.id)).resolves.toMatchObject({ stock: 3 })
    await expect(Cart.findOne({ user: userId })).resolves.toMatchObject({ items: [] })
  })

  it('rejects oversold quantities without decrementing stock', async () => {
    const { token } = await authenticatedUser()
    const product = await activeProduct({ stock: 1 })

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload(product.id, 5))

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 409, message: `Insufficient stock for ${product.name}` },
    })
    await expect(Product.findById(product.id)).resolves.toMatchObject({ stock: 1 })
  })

  it('gates SafePay sessions before looking up the order when credentials are absent', async () => {
    const { token } = await authenticatedUser()

    const response = await request(app)
      .post('/api/payments/create-safepay-session/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(501)
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 501, message: 'SafePay not configured' },
    })
  })
})
