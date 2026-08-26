import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { Cart } from '../src/models/Cart.js'
import { User } from '../src/models/User.js'

let emailSequence = 0

function uniqueEmail() {
  emailSequence += 1
  return `cart-${emailSequence}@example.test`
}

async function authenticatedUser() {
  const email = uniqueEmail()
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Cart Test User', email, password: 'pass1234' })

  expect(response.status).toBe(201)
  await User.updateOne({ email }, { isEmailVerified: true })
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(login.status).toBe(200)
  return login.body.data.accessToken
}

async function activeProduct({ stock = 2 } = {}) {
  const category = await Category.create({ name: `Cart Category ${emailSequence}` })
  return Product.create({
    name: `Cart Product ${emailSequence}`,
    description: 'Product used to test cart stock behavior.',
    price: 25,
    category: category._id,
    stock,
    isActive: true,
  })
}

describe('cart', () => {
  it('clamps a new item quantity to available stock and returns populated cart items', async () => {
    const token = await authenticatedUser()
    const product = await activeProduct({ stock: 2 })

    const add = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.id, quantity: 5 })

    expect(add.status).toBe(200)
    expect(add.body.data.items).toHaveLength(1)
    expect(add.body.data.items[0]).toMatchObject({ product: product.id, quantity: 2 })

    const cart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`)

    expect(cart.status).toBe(200)
    expect(cart.body.data.items).toHaveLength(1)
    expect(cart.body.data.items[0]).toMatchObject({
      quantity: 2,
      product: expect.objectContaining({ _id: product.id, name: product.name, stock: 2 }),
    })
  })

  it('updates and removes a cart item', async () => {
    const token = await authenticatedUser()
    const product = await activeProduct({ stock: 2 })

    const add = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.id, quantity: 1 })
    const itemId = add.body.data.items[0]._id

    const update = await request(app)
      .put(`/api/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 })

    expect(update.status).toBe(200)
    expect(update.body.data.items[0]).toMatchObject({ _id: itemId, quantity: 2 })

    const remove = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(remove.status).toBe(200)
    expect(remove.body.data.items).toHaveLength(0)
    await expect(Cart.findOne()).resolves.toMatchObject({ items: [] })
  })

  it('supports adding items with color object and size variants', async () => {
    const token = await authenticatedUser()
    const product = await activeProduct({ stock: 5 })

    const add = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 1,
        color: { name: 'Black', value: '#171717' },
        size: '16-inch',
      })

    expect(add.status).toBe(200)
    expect(add.body.data.items).toHaveLength(1)
    expect(add.body.data.items[0]).toMatchObject({
      product: product.id,
      quantity: 1,
      color: { name: 'Black', value: '#171717' },
      size: '16-inch',
    })
  })
})
