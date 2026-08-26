import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { User } from '../src/models/User.js'

async function registerUser(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.test',
      password: 'pass1234',
      ...overrides,
    })
}

describe('auth', () => {
  it('registers an unverified customer without creating a session', async () => {
    const response = await registerUser({ role: 'admin' })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.message).toMatch(/verify/i)
    expect(response.headers['set-cookie']).toBeUndefined()
    await expect(User.findOne({ email: 'test@example.test' })).resolves.toMatchObject({ role: 'customer', isEmailVerified: false })
  })

  it('rejects a duplicate email address', async () => {
    await User.create({ name: 'Existing User', email: 'duplicate@example.test', password: 'pass1234' })

    const response = await registerUser({ email: 'duplicate@example.test' })

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 409, message: 'Email already registered' },
    })
  })

  it('logs in verified users and rejects unverified users', async () => {
    await User.create({ name: 'Login User', email: 'login@example.test', password: 'pass1234', isEmailVerified: true })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.test', password: 'pass1234' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.accessToken).toEqual(expect.any(String))
    expect(response.body.data.user.email).toBe('login@example.test')
    expect(response.headers['set-cookie'].some((cookie) => cookie.includes('HttpOnly'))).toBe(true)

    await User.create({ name: 'Unverified User', email: 'unverified@example.test', password: 'pass1234' })
    const unverified = await request(app).post('/api/auth/login').send({ email: 'unverified@example.test', password: 'pass1234' })
    expect(unverified.status).toBe(403)
  })

  it('rejects a login with an incorrect password', async () => {
    await User.create({ name: 'Wrong Password User', email: 'wrong@example.test', password: 'pass1234' })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.test', password: 'not-the-password' })

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 401, message: 'Invalid email or password' },
    })
  })

  it('rotates a refresh token and rejects reuse of the old token', async () => {
    await User.create({ name: 'Rotate User', email: 'rotate@example.test', password: 'pass1234', isEmailVerified: true })

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rotate@example.test', password: 'pass1234' })
    const oldCookie = login.headers['set-cookie'].find((cookie) => cookie.startsWith('refreshToken='))

    const refresh = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', oldCookie)

    expect(refresh.status).toBe(200)
    expect(refresh.body.data.accessToken).toEqual(expect.any(String))
    const newCookie = refresh.headers['set-cookie'].find((cookie) => cookie.startsWith('refreshToken='))
    expect(newCookie).not.toBe(oldCookie)

    const oldToken = oldCookie.split(';')[0].slice('refreshToken='.length)
    const newToken = newCookie.split(';')[0].slice('refreshToken='.length)
    const user = await User.findOne({ email: 'rotate@example.test' }).select('+refreshTokenHash')
    expect(oldToken).not.toBe(newToken)
    expect(user.refreshTokenHash).toEqual(expect.any(String))

    const reuse = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', oldCookie)

    expect(reuse.status).toBe(401)
    expect(reuse.body).toMatchObject({
      success: false,
      error: { code: 401, message: 'Refresh token reuse detected — please log in again' },
    })
  })

  it('logs out, clears the refresh cookie, and rejects its former token', async () => {
    await User.create({ name: 'Logout User', email: 'logout@example.test', password: 'pass1234', isEmailVerified: true })
    const registration = await request(app).post('/api/auth/login').send({ email: 'logout@example.test', password: 'pass1234' })
    const oldCookie = registration.headers['set-cookie'].find((cookie) => cookie.startsWith('refreshToken='))

    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${registration.body.data.accessToken}`)

    expect(logout.status).toBe(200)
    expect(logout.body).toMatchObject({ success: true, data: { message: 'Logged out' } })
    expect(logout.headers['set-cookie'].find((cookie) => cookie.startsWith('refreshToken='))).toMatch(/^refreshToken=;/)

    const refresh = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', oldCookie)

    expect(refresh.status).toBe(401)
    expect(refresh.body).toMatchObject({
      success: false,
      error: { code: 401, message: 'Invalid refresh token' },
    })
  })

  it('bypasses auth rate limits in the test environment', async () => {
    const attempts = await Promise.all(
      Array.from({ length: 11 }, () => request(app)
        .post('/api/auth/login')
        .send({ email: 'missing@example.test', password: 'pass1234' })),
    )

    expect(attempts.map((response) => response.status)).toEqual(Array(11).fill(401))
  })
})
