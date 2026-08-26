import http from 'http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { io } from 'socket.io-client'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { User } from '../src/models/User.js'
import { initSocket, getIO } from '../src/services/socket.js'

let emailSequence = 0

async function accessToken() {
  emailSequence += 1
  const email = `socket-${emailSequence}@example.test`
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Socket Test User', email, password: 'pass1234' })
  expect(response.status).toBe(201)
  await User.updateOne({ email }, { isEmailVerified: true })
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(login.status).toBe(200)
  return login.body.data.accessToken
}

async function activeProduct() {
  const category = await Category.create({ name: `Socket Category ${emailSequence}` })
  return Product.create({
    name: `Socket Product ${emailSequence}`,
    description: 'Product used to test socket push.',
    price: 25,
    category: category._id,
    stock: 5,
    isActive: true,
  })
}

describe('socket.io realtime notifications', () => {
  let httpServer
  let port

  beforeAll(async () => {
    httpServer = http.createServer(app)
    initSocket(httpServer)
    await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve))
    port = httpServer.address().port
  })

  afterAll(async () => {
    getIO()?.close()
    await new Promise((resolve) => httpServer.close(resolve))
  })

  it('rejects a socket handshake without a valid token', async () => {
    const bad = io(`http://127.0.0.1:${port}`, { auth: { token: 'not-a-jwt' }, reconnection: false })
    const error = await new Promise((resolve) => bad.on('connect_error', resolve))
    expect(error.message).toMatch(/Invalid or expired|Authentication/i)
    bad.close()
  })

  it('pushes notification:new the moment an order is placed', async () => {
    const token = await accessToken()
    const product = await activeProduct()

    const client = io(`http://127.0.0.1:${port}`, { auth: { token }, reconnection: false })
    await new Promise((resolve, reject) => {
      client.on('connect', resolve)
      client.on('connect_error', reject)
    })

    // Listen first, then trigger the order through the REST API.
    const received = new Promise((resolve) => client.on('notification:new', resolve))
    const placed = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ product: product.id, quantity: 1 }],
        shippingAddress: { street: '1 Main St', city: 'Karachi', zip: '74000', country: 'Pakistan' },
        paymentMethod: 'cod',
      })
    expect(placed.status).toBe(201)

    const notification = await received
    expect(notification.type).toBe('order_placed')
    expect(notification.title).toContain(placed.body.data.orderNumber)
    client.close()
  })
})
