import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { User } from '../src/models/User.js'

let emailSequence = 0

async function adminToken() {
  emailSequence += 1
  const email = `admin-list-${emailSequence}@example.test`
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin List User', email, password: 'pass1234' })
  expect(response.status).toBe(201)
  await User.updateOne({ email }, { isEmailVerified: true, role: 'admin' })
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(login.status).toBe(200)
  return login.body.data.accessToken
}

async function customerToken() {
  emailSequence += 1
  const email = `admin-list-cust-${emailSequence}@example.test`
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin List Customer', email, password: 'pass1234' })
  expect(response.status).toBe(201)
  await User.updateOne({ email }, { isEmailVerified: true })
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(login.status).toBe(200)
  return login.body.data.accessToken
}

describe('admin lists expose `id` on lean rows', () => {
  it('includes id on admin order rows', async () => {
    const admin = await adminToken()
    const customer = await customerToken()
    const category = await Category.create({ name: `Admin List Category ${emailSequence}` })
    const product = await Product.create({
      name: `Admin List Product ${emailSequence}`,
      description: 'Product used to test admin list shapes.',
      price: 30,
      category: category._id,
      stock: 5,
      isActive: true,
    })
    const placed = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customer}`)
      .send({
        items: [{ product: product.id, quantity: 1 }],
        shippingAddress: { street: '1 Main St', city: 'Karachi', zip: '74000', country: 'Pakistan' },
        paymentMethod: 'cod',
      })
    expect(placed.status).toBe(201)

    const response = await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${admin}`)
    expect(response.status).toBe(200)
    const row = response.body.data.find((o) => o._id === placed.body.data.id)
    expect(row).toBeTruthy()
    expect(row.id).toBe(placed.body.data.id)
    expect(row.orderNumber).toBeTruthy()
  })

  it('includes id on admin review rows', async () => {
    const admin = await adminToken()
    const customer = await customerToken()
    const category = await Category.create({ name: `Admin Rev Category ${emailSequence}` })
    const product = await Product.create({
      name: `Admin Rev Product ${emailSequence}`,
      description: 'Product used to test admin list shapes.',
      price: 30,
      category: category._id,
      stock: 5,
      isActive: true,
    })
    const review = await request(app)
      .post(`/api/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${customer}`)
      .send({ rating: 4, title: 'Solid' })
    expect(review.status).toBe(201)

    const response = await request(app).get('/api/admin/reviews').set('Authorization', `Bearer ${admin}`)
    expect(response.status).toBe(200)
    const row = response.body.data.find((r) => r._id === review.body.data.id)
    expect(row).toBeTruthy()
    expect(row.id).toBe(review.body.data.id)
  })
})
