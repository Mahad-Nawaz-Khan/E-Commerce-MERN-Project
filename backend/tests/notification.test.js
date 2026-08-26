import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { User } from '../src/models/User.js'
import { Notification } from '../src/models/Notification.js'

let emailSequence = 0

function uniqueEmail() {
  emailSequence += 1
  return `notify-${emailSequence}@example.test`
}

async function accessToken({ role = 'customer' } = {}) {
  const email = uniqueEmail()
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Notify Test User', email, password: 'pass1234' })
  expect(response.status).toBe(201)
  await User.updateOne({ email }, { isEmailVerified: true, role })
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(login.status).toBe(200)
  return { token: login.body.data.accessToken, email }
}

async function activeProduct() {
  const category = await Category.create({ name: `Notify Category ${emailSequence}` })
  return Product.create({
    name: `Notify Product ${emailSequence}`,
    description: 'Product used to test notification events.',
    price: 25,
    category: category._id,
    stock: 5,
    isActive: true,
  })
}

// Notifications are fire-and-forget; give them a beat to land before asserting.
const flush = () => new Promise((resolve) => setTimeout(resolve, 150))

async function placeOrder(token, product) {
  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      items: [{ product: product.id, quantity: 1 }],
      shippingAddress: { street: '1 Main St', city: 'Karachi', zip: '74000', country: 'Pakistan' },
      paymentMethod: 'cod',
    })
  expect(response.status).toBe(201)
  return response.body.data
}

describe('notifications', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/notifications')
    expect(response.status).toBe(401)
  })

  it('notifies the customer when an order is placed, and supports mark-read', async () => {
    const { token } = await accessToken()
    const product = await activeProduct()
    await placeOrder(token, product)
    await flush()

    const list = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body.data).toHaveLength(1)
    expect(list.body.data[0]).toMatchObject({ type: 'order_placed', isRead: false })
    expect(list.body.data[0].title).toMatch(/^Order EX-/)

    const unread = await request(app).get('/api/notifications/unread-count').set('Authorization', `Bearer ${token}`)
    expect(unread.body.data.count).toBe(1)

    const read = await request(app)
      .post(`/api/notifications/${list.body.data[0].id}/read`)
      .set('Authorization', `Bearer ${token}`)
    expect(read.status, JSON.stringify(read.body)).toBe(200)
    expect(read.body.data.isRead).toBe(true)
    // readAt drives the TTL sweep — set on mark-read, absent while unread.
    expect(read.body.data.readAt).toBeTruthy()

    const after = await request(app).get('/api/notifications/unread-count').set('Authorization', `Bearer ${token}`)
    expect(after.body.data.count).toBe(0)
  })

  it('notifies the customer when an admin changes the order status', async () => {
    const { token } = await accessToken()
    const admin = await accessToken({ role: 'admin' })
    const product = await activeProduct()
    const order = await placeOrder(token, product)
    await flush()

    const update = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'shipped' })
    expect(update.status).toBe(200)
    await flush()

    const list = await request(app).get('/api/notifications?unread=1').set('Authorization', `Bearer ${token}`)
    // Newest first: the status change, then the original order_placed row.
    expect(list.body.data).toHaveLength(2)
    expect(list.body.data[0]).toMatchObject({ type: 'order_status', isRead: false })
    expect(list.body.data[0].title).toContain('on its way')

    const readAll = await request(app)
      .post('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`)
    expect(readAll.status).toBe(200)

    const unread = await request(app).get('/api/notifications/unread-count').set('Authorization', `Bearer ${token}`)
    expect(unread.body.data.count).toBe(0)
  })

  it('notifies admins when a customer reviews a product', async () => {
    const admin = await accessToken({ role: 'admin' })
    const { token } = await accessToken()
    const product = await activeProduct()

    const review = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, title: 'Superb' })
    expect(review.status).toBe(201)
    await flush()

    const list = await request(app).get('/api/notifications').set('Authorization', `Bearer ${admin.token}`)
    expect(list.body.data).toHaveLength(1)
    expect(list.body.data[0]).toMatchObject({ type: 'review_posted', isRead: false })
    expect(list.body.data[0].title).toContain('5★')
    expect(list.body.data[0].title).toContain(product.name)
  })

  it('auto-expires read notifications 7 days after reading (TTL index)', async () => {
    const indexes = await Notification.collection.indexes()
    const ttl = indexes.find((index) => index.key && index.key.readAt === 1)
    expect(ttl).toBeTruthy()
    expect(ttl.expireAfterSeconds).toBe(7 * 24 * 60 * 60)
  })

  it('does not leak notifications across accounts', async () => {
    const { token } = await accessToken()
    const other = await accessToken()
    const product = await activeProduct()
    await placeOrder(token, product)
    await flush()

    const list = await request(app).get('/api/notifications').set('Authorization', `Bearer ${other.token}`)
    expect(list.status).toBe(200)
    expect(list.body.data).toHaveLength(0)
  })
})
