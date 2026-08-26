import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { User } from '../src/models/User.js'
import { signAccessToken } from '../src/services/token.js'

async function seedProducts() {
  const audio = await Category.create({ name: 'Audio', slug: 'audio' })
  const gaming = await Category.create({ name: 'Gaming', slug: 'gaming' })
  // Staggered timestamps keep the default -createdAt sort deterministic
  // (insertMany would otherwise give every product an identical createdAt).
  const now = Date.now()
  await Product.insertMany([
    {
      name: 'Aurora Headset', slug: 'aurora-headset', description: 'Immersive wireless audio',
      brand: 'Nova', price: 100, category: audio._id, stock: 5, isActive: true,
      createdAt: new Date(now - 3 * 3600_000),
    },
    {
      name: 'Studio Headphones', slug: 'studio-headphones', description: 'Professional audio monitor',
      brand: 'Nova', price: 200, category: audio._id, stock: 3, isActive: true,
      createdAt: new Date(now - 2 * 3600_000),
    },
    {
      name: 'Gaming Mouse', slug: 'gaming-mouse', description: 'Precision mouse',
      brand: 'Axis', price: 50, category: gaming._id, stock: 8, isActive: true,
      createdAt: new Date(now - 1 * 3600_000),
    },
    {
      name: 'Hidden Headset', slug: 'hidden-headset', description: 'Inactive audio product',
      brand: 'Nova', price: 25, category: audio._id, stock: 1, isActive: false,
    },
  ])
  return { audio, gaming }
}

async function adminToken() {
  const user = await User.create({
    name: 'Product Admin',
    email: 'admin@example.test',
    password: 'pass1234',
    isEmailVerified: true,
  })
  const admin = await User.findByIdAndUpdate(user._id, { role: 'admin' }, { new: true })
  return signAccessToken(admin)
}

describe('products', () => {
  it('lists only active products with pagination metadata', async () => {
    await seedProducts()

    const response = await request(app).get('/api/products?page=2&limit=2')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].slug).toBe('aurora-headset')
    expect(response.body.pagination).toEqual({ page: 2, limit: 2, total: 3, pages: 2 })
  })

  it('filters products by category slug', async () => {
    await seedProducts()

    const response = await request(app).get('/api/products?category=audio')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(2)
    expect(response.body.data.map((product) => product.slug).sort()).toEqual([
      'aurora-headset',
      'studio-headphones',
    ])
  })

  it('searches active products using the text index', async () => {
    await seedProducts()

    const response = await request(app).get('/api/products?search=aurora')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({ slug: 'aurora-headset', name: 'Aurora Headset' })
  })

  it('requires authentication to create a product', async () => {
    const { audio } = await seedProducts()

    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Unauthenticated Product', price: 10, category: audio._id, stock: 1 })

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 401, message: 'Authentication required' },
    })
  })

  it('rejects invalid product input for an authenticated admin', async () => {
    const { audio } = await seedProducts()
    const token = await adminToken()

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', price: -5, category: audio._id, stock: -1 })

    expect(response.status).toBe(422)
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 422,
        message: 'Validation failed',
        details: expect.objectContaining({ name: expect.any(String), price: expect.any(String), stock: expect.any(String) }),
      },
    })
  })
})
