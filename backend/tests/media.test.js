import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { User } from '../src/models/User.js'

let emailSequence = 0

function uniqueEmail() {
  emailSequence += 1
  return `media-${emailSequence}@example.test`
}

async function accessToken({ role = 'customer' } = {}) {
  const email = uniqueEmail()
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Media Test User', email, password: 'pass1234' })
  expect(response.status).toBe(201)
  await User.updateOne({ email }, { isEmailVerified: true, role })
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' })
  expect(login.status).toBe(200)
  return login.body.data.accessToken
}

describe('media', () => {
  it('rejects uploads without a token', async () => {
    const response = await request(app).post('/api/media')
    expect(response.status).toBe(401)
  })

  it('rejects uploads from non-admin users', async () => {
    const token = await accessToken()
    const response = await request(app)
      .post('/api/media')
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(403)
  })

  it('fails with a clear 503 when Cloudinary is not configured', async () => {
    const token = await accessToken({ role: 'admin' })
    const response = await request(app)
      .post('/api/media')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('fake image'), { filename: 'x.png', contentType: 'image/png' })
    expect(response.status).toBe(503)
    expect(response.body.error.message).toMatch(/not configured/i)
  })

  it('lists the media library for admins', async () => {
    const token = await accessToken({ role: 'admin' })
    const response = await request(app)
      .get('/api/media')
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toEqual([])
  })
})

describe('category tree', () => {
  it('nests children under their parents', async () => {
    const electronics = await Category.create({ name: 'Tree Electronics' })
    await Category.create({ name: 'Tree Phones', parent: electronics._id })
    await Category.create({ name: 'Tree Laptops', parent: electronics._id })
    const standalone = await Category.create({ name: 'Tree Audio' })

    const response = await request(app).get('/api/categories/tree')

    expect(response.status).toBe(200)
    const byName = new Map(response.body.data.map((node) => [node.name, node]))
    expect(byName.get('Tree Electronics').children.map((child) => child.name).sort())
      .toEqual(['Tree Laptops', 'Tree Phones'])
    expect(byName.get('Tree Audio').children).toEqual([])
    const phones = byName.get('Tree Electronics').children.find((child) => child.name === 'Tree Phones')
    expect(phones.slug).toBeTruthy()
    expect(standalone.slug).toBeTruthy()
  })
})
