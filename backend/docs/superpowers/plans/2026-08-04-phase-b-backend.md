# Phase B — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade Express + MongoDB REST API for the Exclusive storefront — auth (access + refresh tokens, cookies), products/categories/reviews, server-side cart/wishlist, fixed-order flow (stock validation + server-computed totals), SafePay integration layer (gated), seed data, and endpoint tests.

**Architecture:** ES Modules, Express 5, Mongoose 9, centralized error handling (`ApiError` + `asyncHandler` + `errorHandler`), layered (routes → validate → controller → model), security-hardened (helmet, rate-limit, cookie-parser, CORS allowlist, express-validator, bcrypt 12, env-fail-fast).

**Spec:** `docs/superpowers/specs/2026-08-04-phase-b-backend-design.md`

**Conventions:**
- Work from `E-Commerce MERN Project/backend/` (its own git repo, branch `main`).
- ES Modules everywhere (`import`/`export`, `"type": "module"`).
- Commit each task with its exact message.
- Run `npm run lint` before committing JS.
- Standard envelope: success `{ success: true, data }`, error `{ success: false, error: { code, message, details? } }`.

---

## File Structure

```
backend/
├── src/
│   ├── app.js  server.js
│   ├── config/  env.js  db.js  cors.js
│   ├── models/  User.js  Category.js  Product.js  Review.js  Cart.js  Wishlist.js  Order.js  PasswordReset.js
│   ├── controllers/  auth user product category review cart wishlist order payment
│   ├── routes/  index.js + 9 resource routes
│   ├── middleware/  auth.js  validate.js  error.js  upload.js
│   ├── services/  token.js  email.js  payment.js
│   ├── utils/  ApiError.js  asyncHandler.js  queryService.js  logger.js
│   └── seed/  seed.js  users.seed.js  categories.seed.js  products.seed.js
├── tests/  setup.js  auth.test.js  product.test.js  cart.test.js  order.test.js
├── .env.example  .gitignore  package.json  eslint.config.js  vitest.config.js  README.md
```

---

## Milestones

- **M1 — Project init + config** (Tasks 1–4): package.json, env, db, app skeleton, health route.
- **M2 — Models** (Tasks 5–8): all 8 models + hooks.
- **M3 — Auth core** (Tasks 9–13): utils, token/email services, auth middleware, auth routes/controller.
- **M4 — Resource APIs** (Tasks 14–21): products, categories, reviews, cart, wishlist, orders, users.
- **M5 — Payment + seed** (Tasks 22–25): SafePay service/routes, seed script.
- **M6 — Tests + verify** (Tasks 26–30): test setup + 4 suites, README, final gate.

---

## Milestone 1 — Project init + config

### Task 1: package.json + install deps

**Files:** Create `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "exclusive-backend",
  "version": "1.0.0",
  "description": "Exclusive storefront REST API — Express + MongoDB",
  "type": "module",
  "main": "src/server.js",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seed.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint ."
  }
}
```

- [ ] **Step 2: Install runtime deps**

```bash
npm install express mongoose jsonwebtoken bcryptjs cookie-parser cors helmet express-rate-limit express-xss-sanitizer express-validator multer nodemailer pino pino-http @sfpy/node-sdk dotenv
```

- [ ] **Step 3: Install dev deps**

```bash
npm install -D nodemon eslint globals vitest supertest mongodb-memory-server
```

- [ ] **Step 4: Verify**

`npm ls express mongoose jsonwebtoken bcryptjs cookie-parser @sfpy/node-sdk vitest supertest` → all present.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: initialize package.json + install dependencies"
```

---

### Task 2: eslint + vitest config + .env.example

**Files:** Create `eslint.config.js`, `vitest.config.js`, `.env.example`

- [ ] **Step 1: eslint.config.js**

```js
import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['tests/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly', it: 'readonly', test: 'readonly',
        expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly',
        beforeAll: 'readonly', afterAll: 'readonly',
      },
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'coverage/'],
  },
]
```

- [ ] **Step 2: vitest.config.js**

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    testTimeout: 15000,
  },
})
```

- [ ] **Step 3: .env.example** (real `.env` is gitignored; this is the template)

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://127.0.0.1:27017/exclusive

# JWT secrets — MUST be set, no fallbacks. Use long random strings.
JWT_ACCESS_SECRET=change-me-access-min-32-chars-long-random
JWT_REFRESH_SECRET=change-me-refresh-min-32-chars-long-random
JWT_EMAIL_SECRET=change-me-email-min-32-chars-long-random

# Token expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (Mailtrap for dev — replace with real SMTP in prod)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=Exclusive <no-reply@exclusive.test>

# SafePay (leave blank to run COD-only; add sandbox keys to enable)
SAFEPAY_ENVIRONMENT=sandbox
SAFEPAY_API_KEY=
SAFEPAY_V1_SECRET=
SAFEPAY_WEBHOOK_SECRET=
```

- [ ] **Step 4: Lint config files**

`npm run lint` — clean.

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js vitest.config.js .env.example
git commit -m "chore: eslint + vitest config + .env.example"
```

---

### Task 3: config (env fail-fast + db + cors)

**Files:** Create `src/config/env.js`, `src/config/db.js`, `src/config/cors.js`

- [ ] **Step 1: src/config/env.js** — validates + freezes env. Throws on missing/weak secrets.

```js
import dotenv from 'dotenv'

dotenv.config()

function required(key) {
  const v = process.env[key]
  if (!v || !v.trim()) {
    throw new Error(`Missing required env var: ${key}. Copy .env.example to .env and fill it in.`)
  }
  return v.trim()
}

function secret(key, minLen = 32) {
  const v = required(key)
  if (v.length < minLen && process.env.NODE_ENV === 'production') {
    throw new Error(`${key} must be at least ${minLen} characters in production.`)
  }
  if (v.startsWith('change-me')) {
    console.warn(`[env] WARNING: ${key} is still a placeholder. Set a real secret before deploying.`)
  }
  return v
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: required('MONGO_URI'),
  jwt: {
    accessSecret: secret('JWT_ACCESS_SECRET'),
    refreshSecret: secret('JWT_REFRESH_SECRET'),
    emailSecret: secret('JWT_EMAIL_SECRET'),
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',').map((s) => s.trim()).filter(Boolean),
  email: {
    host: process.env.EMAIL_HOST || '',
    port: Number(process.env.EMAIL_PORT) || 2525,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'Exclusive <no-reply@exclusive.test>',
  },
  safepay: {
    environment: process.env.SAFEPAY_ENVIRONMENT || 'sandbox',
    apiKey: process.env.SAFEPAY_API_KEY || '',
    v1Secret: process.env.SAFEPAY_V1_SECRET || '',
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || '',
    configured: !!(process.env.SAFEPAY_API_KEY && process.env.SAFEPAY_V1_SECRET),
  },
})
```

- [ ] **Step 2: src/config/db.js**

```js
import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
  return mongoose.connection
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
```

- [ ] **Step 3: src/config/cors.js**

```js
import cors from 'cors'
import { env } from './env.js'

export const corsMiddleware = cors({
  origin(origin, cb) {
    // allow same-origin / curl (no origin) + allowlisted origins
    if (!origin || env.allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})
```

- [ ] **Step 4: Lint + Commit**

```bash
npm run lint
git add src/config/
git commit -m "feat(config): env fail-fast + db connect + cors allowlist"
```

---

### Task 4: utils + logger + app skeleton + health

**Files:** Create `src/utils/{ApiError.js,asyncHandler.js,logger.js}`, `src/middleware/error.js`, `src/app.js`, `src/server.js`

- [ ] **Step 1: src/utils/ApiError.js**

```js
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
  static badRequest(msg = 'Bad request', details) { return new ApiError(400, msg, details) }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg) }
  static forbidden(msg = 'Forbidden') { return new ApiError(403, msg) }
  static notFound(msg = 'Not found') { return new ApiError(404, msg) }
  static conflict(msg = 'Conflict') { return new ApiError(409, msg) }
  static unprocessable(msg = 'Validation failed', details) { return new ApiError(422, msg, details) }
  static notImplemented(msg = 'Not implemented') { return new ApiError(501, msg) }
}
```

- [ ] **Step 2: src/utils/asyncHandler.js**

```js
// Wraps an async controller so rejections flow to the error handler.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
```

- [ ] **Step 3: src/utils/logger.js**

```js
import pino from 'pino'
import { env } from '../config/env.js'

export const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  transport: env.isProd ? undefined : { target: 'pino-pretty', options: { colorize: true } },
})
```
NOTE: if `pino-pretty` isn't installed, install it as a dev dep (`npm i -D pino-pretty`) so the dev transport works. Add it to the Task 1 dev deps retroactively if needed.

- [ ] **Step 4: src/middleware/error.js** — centralized notFound + errorHandler.

```js
import { ApiError } from '../utils/ApiError.js'

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500
  const response = {
    success: false,
    error: {
      code: statusCode,
      message: err.isOperational ? err.message : 'Internal server error',
    },
  }
  if (err.details) response.error.details = err.details
  if (statusCode === 500) {
    console.error('[error]', err.stack || err)
  }
  res.status(statusCode).json(response)
}
```

- [ ] **Step 5: src/app.js** — express app, middleware order, health route, route mount point (routes index added in M3).

```js
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { xss } from 'express-xss-sanitizer'
import pinoHttp from 'pino-http'
import { corsMiddleware } from './config/cors.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'
import { notFound, errorHandler } from './middleware/error.js'
import { router as apiRouter } from './routes/index.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(pinoHttp({ logger }))
app.use(corsMiddleware)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(xss())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => env.nodeEnv === 'test', // deterministic endpoint tests
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 429, message: 'Too many requests, slow down.' } },
})
app.use('/api', limiter)

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.nodeEnv, time: new Date().toISOString() } })
})

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)

export { app }
```

- [ ] **Step 6: src/server.js** — bootstrap.

```js
import { app } from './app.js'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { logger } from './utils/logger.js'

async function start() {
  await connectDB()
  const server = app.listen(env.port, () => {
    logger.info(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`)
  })
  const shutdown = (sig) => () => {
    logger.info(`[server] ${sig} received, shutting down`)
    server.close(() => process.exit(0))
  }
  process.on('SIGTERM', shutdown('SIGTERM'))
  process.on('SIGINT', shutdown('SIGINT'))
}

start().catch((err) => {
  logger.error({ err }, '[server] failed to start')
  process.exit(1)
})
```

- [ ] **Step 7: routes/index.js placeholder** (so app.js import resolves; real routes added in M3).

```js
import { Router } from 'express'
export const router = Router()
// Resource routers mounted here in later tasks.
```

- [ ] **Step 8: Create a .env with real values for dev** — copy `.env.example` to `.env` and fill in real secrets (use the leaked mock values for dev ONLY if you accept the risk; recommended: generate fresh secrets with `openssl rand -hex 32`). The `.env` is gitignored.

```bash
cp .env.example .env
# then edit .env: set MONGO_URI, generate JWT_*_SECRET values, etc.
```

- [ ] **Step 9: Lint + boot smoke test**

`npm run lint` → clean. Then `node src/server.js` briefly (Ctrl-C once listening) — should print `[server] listening`. (env.js must NOT throw if `.env` is filled.)

- [ ] **Step 10: Commit**

```bash
git add src/
git commit -m "feat(app): express skeleton (helmet/cors/rate-limit/cookies) + health + error handler"
```

---
## Milestone 2 — Models

> Pattern: each model in its own file under `src/models/`. Mongoose schemas with the exact fields from spec §5. No controllers/routes yet.

### Task 5: User + PasswordReset models

**Files:** Create `src/models/User.js`, `src/models/PasswordReset.js`

- [ ] **Step 1: src/models/User.js**

```js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: 'Home' },
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zip: { type: String, trim: true },
  country: { type: String, trim: true },
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: { type: String, trim: true },
  addresses: [addressSchema],
  isEmailVerified: { type: Boolean, default: false },
  refreshTokenHash: { type: String, select: false },
}, { timestamps: true })

// Hash password on save/modify (12 rounds).
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Sanitize: strip sensitive fields when serializing.
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshTokenHash
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  return obj
}

export const User = mongoose.model('User', userSchema)
```

- [ ] **Step 2: src/models/PasswordReset.js**

```js
import mongoose from 'mongoose'

const passwordResetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true })

// Auto-expire old tokens via TTL index (remove 1h after expiry).
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 })

export const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema)
```

- [ ] **Step 3: Lint + Commit**

```bash
npm run lint
git add src/models/User.js src/models/PasswordReset.js
git commit -m "feat(models): User (bcrypt 12, role, refresh hash) + PasswordReset (TTL)"
```

---

### Task 6: Category + Product models

**Files:** Create `src/models/Category.js`, `src/models/Product.js`

- [ ] **Step 1: src/models/Category.js**

```js
import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, trim: true },
  image: { type: String, trim: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true })

// Collision-safe slug generation.
categorySchema.pre('validate', async function makeSlug(next) {
  if (this.isModified('name') && !this.slug) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    let slug = base || 'category'
    let i = 1
    while (await mongoose.models.Category.exists({ slug })) slug = `${base}-${i++}`
    this.slug = slug
  }
  next()
})

export const Category = mongoose.model('Category', categorySchema)
```

- [ ] **Step 2: src/models/Product.js**

```js
import mongoose from 'mongoose'

const colorSchema = new mongoose.Schema({ name: String, value: String }, { _id: false })

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, trim: true },
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price must be ≥ 0'] },
  originalPrice: { type: Number, min: 0, default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, trim: true },
  images: [{ type: String, trim: true }],
  stock: { type: Number, default: 0, min: [0, 'Stock must be ≥ 0'] },
  sku: { type: String, unique: true, sparse: true, trim: true },
  colors: [colorSchema],
  sizes: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true })

productSchema.pre('validate', async function makeSlug(next) {
  if (this.isModified('name') && !this.slug) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    let slug = base || 'product'
    let i = 1
    while (await mongoose.models.Product.exists({ slug })) slug = `${base}-${i++}`
    this.slug = slug
  }
  next()
})

// Virtual alias for filtering convenience.
productSchema.virtual('comparePrice').get(function () { return this.price })

productSchema.index({ name: 'text', description: 'text', brand: 'text' })
productSchema.index({ category: 1, isActive: 1, price: 1, ratingAvg: -1 })

export const Product = mongoose.model('Product', productSchema)
```

- [ ] **Step 3: Lint + Commit**

```bash
npm run lint
git add src/models/Category.js src/models/Product.js
git commit -m "feat(models): Category (collision-safe slug) + Product (text index)"
```

---

### Task 7: Review model with aggregation hooks

**Files:** Create `src/models/Review.js`

- [ ] **Step 1: src/models/Review.js**

```js
import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  body: { type: String, trim: true },
}, { timestamps: true })

// One review per user per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

// Recompute product's ratingAvg + ratingCount on save/remove.
async function recomputeRating(productId) {
  const [agg] = await mongoose.models.Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  await mongoose.models.Product.findByIdAndUpdate(productId, {
    ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0,
    ratingCount: agg ? agg.count : 0,
  })
}

reviewSchema.post('save', function () { return recomputeRating(this.product) })
reviewSchema.post('findOneAndDelete', function (doc) {
  return doc ? recomputeRating(doc.product) : null
})
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  return recomputeRating(this.product)
})

reviewSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  return obj
}

export const Review = mongoose.model('Review', reviewSchema)
```

- [ ] **Step 2: Lint + Commit**

```bash
npm run lint
git add src/models/Review.js
git commit -m "feat(models): Review (unique per user/product, auto-recompute product rating)"
```

---

### Task 8: Cart + Wishlist + Order models

**Files:** Create `src/models/Cart.js`, `src/models/Wishlist.js`, `src/models/Order.js`

- [ ] **Step 1: src/models/Cart.js**

```js
import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  color: { type: String },
  size: { type: String },
}, { _id: true })

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
}, { timestamps: true })

export const Cart = mongoose.model('Cart', cartSchema)
```

- [ ] **Step 2: src/models/Wishlist.js**

```js
import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true })

export const Wishlist = mongoose.model('Wishlist', wishlistSchema)
```

- [ ] **Step 3: src/models/Order.js**

```js
import mongoose from 'mongoose'

const shippingSchema = new mongoose.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  zip: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
}, { _id: false })

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }, // snapshot at order time
}, { _id: true })

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: {
    type: [orderItemSchema],
    validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: 'Order must have at least one item' },
  },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: { type: shippingSchema, required: true },
  paymentMethod: { type: String, enum: ['card', 'cod', 'safepay'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentRef: { type: String }, // SafePay tracker id
}, { timestamps: true })

orderSchema.index({ user: 1, createdAt: -1 })

orderSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  return obj
}

export const Order = mongoose.model('Order', orderSchema)
```

- [ ] **Step 4: Lint + Commit**

```bash
npm run lint
git add src/models/Cart.js src/models/Wishlist.js src/models/Order.js
git commit -m "feat(models): Cart + Wishlist (per-user) + Order (price snapshot)"
```

---

## Milestone 3 — Auth core

### Task 9: queryService util (salvaged + ESM)

**Files:** Create `src/utils/queryService.js`

- [ ] **Step 1: Implement** (adapted from Backend-Mock; cleaned, ESM, no owner-aware logic — that stays in controllers).

```js
import { ApiError } from './ApiError.js'

/**
 * Builds a Mongoose filter/sort/paginate pipeline from Express query params.
 * @param {object} query  req.query
 * @param {object} opts   { searchFields: string[], baseFilter: object }
 */
export function buildQuery(query = {}, opts = {}) {
  const { searchFields = [], baseFilter = {} } = opts
  const filter = { ...baseFilter }
  const excluded = ['page', 'limit', 'sort', 'fields', 'search']

  // Free-text search
  if (query.search && searchFields.length) {
    filter.$text = { $search: String(query.search).trim() }
  }

  // Bracketed operators: price[gte]=100 → { price: { $gte: 100 } }
  for (const [key, value] of Object.entries(query)) {
    if (excluded.includes(key)) continue
    if (typeof value === 'object' && value !== null) {
      const ops = {}
      for (const [op, v] of Object.entries(value)) {
        if (['gte', 'gt', 'lte', 'lt', 'ne', 'in', 'nin'].includes(op)) {
          ops[`$${op}`] = Array.isArray(v) ? v.map(coerce) : coerce(v)
        }
      }
      if (Object.keys(ops).length) filter[key] = ops
    } else {
      filter[key] = coerce(value)
    }
  }

  // Sort
  let sort = '-createdAt'
  if (query.sort === 'price-asc') sort = 'price'
  else if (query.sort === 'price-desc') sort = '-price'
  else if (query.sort === 'rating') sort = '-ratingAvg'
  else if (query.sort === 'newest') sort = '-createdAt'

  // Pagination
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 12))
  const skip = (page - 1) * limit

  // Field selection
  let select = ''
  if (query.fields) select = String(query.fields).split(',').join(' ')

  return { filter, sort, skip, limit, page, select }
}

function coerce(v) {
  if (v === 'true') return true
  if (v === 'false') return false
  if (v !== '' && !Number.isNaN(Number(v))) return Number(v)
  return v
}

/** Apply query to a Mongoose model and return paginated envelope. */
export async function paginateQuery(Model, query, opts = {}) {
  const { filter, sort, skip, limit, page, select } = buildQuery(query, opts)
  const [data, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit).select(select).lean({ getters: true, virtuals: true }),
    Model.countDocuments(filter),
  ])
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  }
}

export { ApiError }
```

- [ ] **Step 2: Lint + Commit**

```bash
npm run lint
git add src/utils/queryService.js
git commit -m "feat(utils): queryService (filter/sort/paginate) salvaged + ESM"
```

---

### Task 10: token service (sign/verify/rotate refresh)

**Files:** Create `src/services/token.js`

- [ ] **Step 1: Implement**

```js
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

export function signAccessToken(user) {
  return jwt.sign({ id: user._id || user.id, role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiry,
  })
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user._id || user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  })
}

export function signEmailToken(payload) {
  return jwt.sign(payload, env.jwt.emailSecret, { expiresIn: '24h' })
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.accessSecret)
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token')
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.jwt.refreshSecret)
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token')
  }
}

export function verifyEmailToken(token) {
  try {
    return jwt.verify(token, env.jwt.emailSecret)
  } catch {
    throw ApiError.unauthorized('Invalid or expired email token')
  }
}

/** Hash a refresh token before storing on the user. */
export async function hashRefreshToken(token) {
  return bcrypt.hash(token, 12)
}

/** Refresh-token cookie options. */
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

export const REFRESH_COOKIE = 'refreshToken'
```

- [ ] **Step 2: Lint + Commit**

```bash
npm run lint
git add src/services/token.js
git commit -m "feat(services): token service (access/refresh/email sign+verify, cookie opts)"
```

---

### Task 11: email service (nodemailer)

**Files:** Create `src/services/email.js`

- [ ] **Step 1: Implement**

```js
import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { signEmailToken } from './token.js'

let transport = null
function getTransport() {
  if (transport) return transport
  if (!env.email.user || !env.email.pass) {
    return null // email disabled in this env (logs instead)
  }
  transport = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    auth: { user: env.email.user, pass: env.email.pass },
  })
  return transport
}

async function send(mail) {
  const t = getTransport()
  if (!t) {
    console.log('[email:dev] (no SMTP configured) — would send:', mail.subject, '→', mail.to)
    console.log('[email:dev] link/preview:', mail.html || mail.text)
    return
  }
  await t.sendMail({ from: env.email.from, ...mail })
}

export async function sendVerificationEmail(user) {
  const token = signEmailToken({ id: user._id || user.id, email: user.email })
  const url = `${env.clientUrl}/verify-email?token=${token}`
  await send({
    to: user.email,
    subject: 'Verify your Exclusive account',
    html: `<p>Welcome to Exclusive, ${user.name}.</p><p>Verify your email:</p><p><a href="${url}">${url}</a></p><p>This link expires in 24 hours.</p>`,
  })
}

export async function sendPasswordResetEmail(user, resetToken) {
  const url = `${env.clientUrl}/reset-password?token=${resetToken}`
  await send({
    to: user.email,
    subject: 'Reset your Exclusive password',
    html: `<p>We received a request to reset your password.</p><p><a href="${url}">${url}</a></p><p>This link expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
  })
}
```

- [ ] **Step 2: Lint + Commit**

```bash
npm run lint
git add src/services/email.js
git commit -m "feat(services): nodemailer email (verify + reset) with dev fallback"
```

---

### Task 12: auth middleware (authenticate + authorizeRoles + validate)

**Files:** Create `src/middleware/auth.js`, `src/middleware/validate.js`

- [ ] **Step 1: src/middleware/auth.js**

```js
import { User } from '../models/User.js'
import { verifyAccessToken } from '../services/token.js'
import { ApiError } from '../utils/ApiError.js'

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw ApiError.unauthorized('Authentication required')
    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id)
    if (!user) throw ApiError.unauthorized('User no longer exists')
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'))
    }
    next()
  }
}
```

- [ ] **Step 2: src/middleware/validate.js** — runs express-validator; collects errors.

```js
import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

export function validate(rules) {
  return async (req, res, next) => {
    await Promise.all(rules.map((rule) => rule.run(req)))
    const result = validationResult(req)
    if (result.isEmpty()) return next()
    const details = result.array().reduce((acc, e) => { acc[e.path] = e.msg; return acc }, {})
    next(ApiError.unprocessable('Validation failed', details))
  }
}
```

- [ ] **Step 3: Lint + Commit**

```bash
npm run lint
git add src/middleware/auth.js src/middleware/validate.js
git commit -m "feat(middleware): authenticate + authorizeRoles + validate"
```

---

### Task 13: auth controller + routes + mount

**Files:** Create `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`; Modify `src/routes/index.js`, `src/app.js` (auth limiter)

- [ ] **Step 1: src/controllers/auth.controller.js**

```js
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { PasswordReset } from '../models/PasswordReset.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, verifyEmailToken,
  hashRefreshToken, refreshCookieOptions, REFRESH_COOKIE,
} from '../services/token.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js'

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions())
}
function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (await User.exists({ email })) throw ApiError.conflict('Email already registered')
  // role is NEVER accepted from the client — always customer on self-register.
  const user = await User.create({ name, email, password, role: 'customer' })
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  user.refreshTokenHash = await hashRefreshToken(refreshToken)
  await user.save()
  setRefreshCookie(res, refreshToken)
  sendVerificationEmail(user).catch((e) => console.error('[email]', e.message))
  res.status(201).json({ success: true, data: { user, accessToken } })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password')
  }
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  user.refreshTokenHash = await hashRefreshToken(refreshToken)
  await user.save()
  setRefreshCookie(res, refreshToken)
  res.json({ success: true, data: { user, accessToken } })
})

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) throw ApiError.unauthorized('No refresh token')
  const decoded = verifyRefreshToken(token)
  const user = await User.findById(decoded.id).select('+refreshTokenHash')
  if (!user || !user.refreshTokenHash) throw ApiError.unauthorized('Invalid refresh token')

  // Reuse detection: the presented token must match the stored hash.
  const matches = await bcrypt.compare(token, user.refreshTokenHash)
  if (!matches) {
    // Stolen-token scenario — revoke the whole family.
    user.refreshTokenHash = null
    await user.save()
    clearRefreshCookie(res)
    throw ApiError.unauthorized('Refresh token reuse detected — please log in again')
  }

  // Rotate.
  const newRefresh = signRefreshToken(user)
  user.refreshTokenHash = await hashRefreshToken(newRefresh)
  await user.save()
  setRefreshCookie(res, newRefresh)
  res.json({ success: true, data: { accessToken: signAccessToken(user) } })
})

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshTokenHash = null
    await req.user.save()
  }
  clearRefreshCookie(res)
  res.json({ success: true, data: { message: 'Logged out' } })
})

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query
  if (!token) throw ApiError.badRequest('Missing verification token')
  const decoded = verifyEmailToken(token)
  const user = await User.findById(decoded.id)
  if (!user) throw ApiError.notFound('User not found')
  if (!user.isEmailVerified) {
    user.isEmailVerified = true
    await user.save()
  }
  res.json({ success: true, data: { message: 'Email verified' } })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email: String(email).toLowerCase() })
  // Always 200 — don't leak which emails exist.
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex')
    const tokenHash = await bcrypt.hash(raw, 12)
    await PasswordReset.create({ user: user._id, tokenHash, expiresAt: Date.now() + 10 * 60 * 1000 })
    sendPasswordResetEmail(user, raw).catch((e) => console.error('[email]', e.message))
  }
  res.json({ success: true, data: { message: 'If that email exists, a reset link has been sent.' } })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) throw ApiError.badRequest('Token and password are required')
  const candidates = await PasswordReset.find({ used: false, expiresAt: { $gt: Date.now() } })
  let match = null
  for (const c of candidates) {
    if (await bcrypt.compare(token, c.tokenHash)) { match = c; break }
  }
  if (!match) throw ApiError.badRequest('Invalid or expired reset token')
  const user = await User.findById(match.user).select('+password')
  user.password = password
  user.refreshTokenHash = null // force re-login everywhere
  await user.save()
  match.used = true
  await match.save()
  res.json({ success: true, data: { message: 'Password reset — please log in.' } })
})
```

- [ ] **Step 2: src/routes/auth.routes.js**

```js
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import { env } from '../config/env.js'
import * as ctrl from '../controllers/auth.controller.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => env.nodeEnv === 'test', // deterministic endpoint tests
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 429, message: 'Too many auth attempts.' } },
})

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 chars'),
]
const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
]
const emailRule = body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail()
const resetRules = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 chars'),
]

router.post('/register', authLimiter, validate(registerRules), ctrl.register)
router.post('/login', authLimiter, validate(loginRules), ctrl.login)
router.post('/refresh', ctrl.refresh)
router.post('/logout', authenticate, ctrl.logout)
router.get('/me', authenticate, ctrl.getMe)
router.get('/verify-email', ctrl.verifyEmail)
router.post('/forgot-password', authLimiter, validate([emailRule]), ctrl.forgotPassword)
router.post('/reset-password', authLimiter, validate(resetRules), ctrl.resetPassword)

export { router }
```

- [ ] **Step 3: Mount in src/routes/index.js**

```js
import { Router } from 'express'
import { router as authRouter } from './auth.routes.js'

export const router = Router()
router.use('/auth', authRouter)
// other resource routers added in M4
```

- [ ] **Step 4: Boot test** — `npm run dev`, then `curl -X POST http://localhost:5000/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Test","email":"test@x.test","password":"pass1234"}'` → expect 201 + a Set-Cookie + `accessToken`. Then `curl http://localhost:5000/api/health`.

- [ ] **Step 5: Lint + Commit**

```bash
npm run lint
git add src/controllers/auth.controller.js src/routes/auth.routes.js src/routes/index.js
git commit -m "feat(auth): register/login/refresh(rotation+reuse-detect)/logout/me/verify/forgot/reset"
```

---
## Milestone 4 — Resource APIs

### Task 14: products controller + routes

**Files:** Create `src/controllers/product.controller.js`, `src/routes/product.routes.js`; update `src/routes/index.js`

- [ ] **Step 1: src/controllers/product.controller.js** — public list (filter/sort/paginate via queryService), slug lookup, admin CRUD.

```js
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

// Resolve category slug → _id for filtering when ?category=<slug> is passed.
async function resolveCategoryFilter(query) {
  if (query.category) {
    const cat = await Category.findOne({ $or: [{ slug: query.category }, { name: query.category }] })
    if (cat) { query.category = cat._id.toString() }
  }
}

export const getProducts = asyncHandler(async (req, res) => {
  await resolveCategoryFilter(req.query)
  const result = await paginateQuery(Product, req.query, {
    searchFields: ['name', 'description', 'brand'],
    baseFilter: { isActive: true },
  })
  res.json({ success: true, ...result })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug')
  if (!product) throw ApiError.notFound('Product not found')
  res.json({ success: true, data: product })
})

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json({ success: true, data: product })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!product) throw ApiError.notFound('Product not found')
  res.json({ success: true, data: product })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) throw ApiError.notFound('Product not found')
  res.json({ success: true, data: { message: 'Product deleted' } })
})
```

- [ ] **Step 2: src/routes/product.routes.js**

```js
import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/product.controller.js'

const router = Router()

const productRules = [
  body('name').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').notEmpty(),
  body('stock').optional().isInt({ min: 0 }),
]

router.get('/', ctrl.getProducts)
router.get('/:slug', ctrl.getProductBySlug)
router.post('/', authenticate, authorizeRoles('admin'), validate(productRules), ctrl.createProduct)
router.put('/:id', authenticate, authorizeRoles('admin'), validate(productRules), ctrl.updateProduct)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteProduct)

export { router }
```

- [ ] **Step 3: Mount** — add to `src/routes/index.js`:
```js
import { router as productRouter } from './product.routes.js'
// inside router.use(...) block:
router.use('/products', productRouter)
```

- [ ] **Step 4: Lint + Commit**

```bash
npm run lint
git add src/controllers/product.controller.js src/routes/product.routes.js src/routes/index.js
git commit -m "feat(products): public list (filter/sort/paginate/search) + admin CRUD"
```

---

### Task 15: categories controller + routes

**Files:** Create `src/controllers/category.controller.js`, `src/routes/category.routes.js`; mount

- [ ] **Step 1: controller** — public list (tree optional), admin CRUD.

```js
import { Category } from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

export const getCategories = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginateQuery(Category, { limit: 100, ...req.query }, {})
  res.json({ success: true, data, pagination })
})

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ $or: [{ slug: req.params.id }, { _id: req.params.id }] })
  if (!category) throw ApiError.notFound('Category not found')
  res.json({ success: true, data: category })
})

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body)
  res.status(201).json({ success: true, data: category })
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!category) throw ApiError.notFound('Category not found')
  res.json({ success: true, data: category })
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) throw ApiError.notFound('Category not found')
  res.json({ success: true, data: { message: 'Category deleted' } })
})
```

- [ ] **Step 2: routes** — public GET, admin POST/PUT/DELETE.
```js
import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/category.controller.js'

const router = Router()
router.get('/', ctrl.getCategories)
router.get('/:id', ctrl.getCategory)
router.post('/', authenticate, authorizeRoles('admin'), ctrl.createCategory)
router.put('/:id', authenticate, authorizeRoles('admin'), ctrl.updateCategory)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteCategory)

export { router }
```

- [ ] **Step 3: Mount** (`router.use('/categories', categoryRouter)`) + Lint + Commit `feat(categories): public list + admin CRUD`

---

### Task 16: reviews controller + routes

**Files:** Create `src/controllers/review.controller.js`, `src/routes/review.routes.js`; mount

- [ ] **Step 1: controller** — create (one per user per product, enforced by model unique index), list by product, update/delete (owner or admin).

```js
import { Review } from '../models/Review.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getReviewsForProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort('-createdAt')
  res.json({ success: true, data: reviews })
})

export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) throw ApiError.notFound('Product not found')
  try {
    const review = await Review.create({
      product: product._id, user: req.user._id,
      rating: req.body.rating, title: req.body.title, body: req.body.body,
    })
    res.status(201).json({ success: true, data: review })
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict('You have already reviewed this product')
    throw err
  }
})

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw ApiError.notFound('Review not found')
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only edit your own review')
  }
  review.rating = req.body.rating ?? review.rating
  review.title = req.body.title ?? review.title
  review.body = req.body.body ?? review.body
  await review.save()
  res.json({ success: true, data: review })
})

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw ApiError.notFound('Review not found')
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own review')
  }
  await Review.deleteOne({ _id: review._id })
  res.json({ success: true, data: { message: 'Review deleted' } })
})
```

- [ ] **Step 2: routes**
```js
import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/review.controller.js'

const router = Router()
router.get('/products/:productId/reviews', ctrl.getReviewsForProduct)
router.post('/products/:productId/reviews', authenticate, validate([
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').optional().trim(),
  body('body').optional().trim(),
]), ctrl.createReview)
router.put('/reviews/:id', authenticate, ctrl.updateReview)
router.delete('/reviews/:id', authenticate, ctrl.deleteReview)

export { router }
```

- [ ] **Step 3: Mount** + Lint + Commit `feat(reviews): per-product reviews (unique per user) + owner/admin edit/delete`

---

### Task 17: cart controller + routes

**Files:** Create `src/controllers/cart.controller.js`, `src/routes/cart.routes.js`; mount

- [ ] **Step 1: controller** — get-or-create the user's cart, add/update/remove items (qty clamps to stock), clear.

```js
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId })
  if (!cart) cart = await Cart.create({ user: userId, items: [] })
  return cart
}

export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id)
  await cart.populate('items.product', 'name price slug images stock isActive')
  res.json({ success: true, data: cart })
})

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color, size } = req.body
  const product = await Product.findById(productId)
  if (!product || !product.isActive) throw ApiError.notFound('Product not found')
  if (product.stock < quantity) throw ApiError.badRequest(`Only ${product.stock} in stock`)
  const cart = await getCart(req.user._id)
  const existing = cart.items.find((i) =>
    i.product.toString() === productId && i.color === color && i.size === size)
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock)
  } else {
    cart.items.push({ product: productId, quantity: Math.min(quantity, product.stock), color, size })
  }
  await cart.save()
  res.json({ success: true, data: cart })
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body
  const cart = await getCart(req.user._id)
  const item = cart.items.id(req.params.itemId)
  if (!item) throw ApiError.notFound('Cart item not found')
  const product = await Product.findById(item.product)
  if (product && quantity > product.stock) throw ApiError.badRequest(`Only ${product.stock} in stock`)
  if (quantity <= 0) { cart.items.pull(item); }
  else { item.quantity = quantity }
  await cart.save()
  res.json({ success: true, data: cart })
})

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id)
  cart.items.pull(req.params.itemId)
  await cart.save()
  res.json({ success: true, data: cart })
})

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id)
  cart.items = []
  await cart.save()
  res.json({ success: true, data: cart })
})
```

- [ ] **Step 2: routes** — all auth.
```js
import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/cart.controller.js'

const router = Router()
router.use(authenticate)
router.get('/', ctrl.getMyCart)
router.post('/items', validate([
  body('productId').notEmpty(),
  body('quantity').optional().isInt({ min: 1 }),
]), ctrl.addToCart)
router.put('/items/:itemId', validate([body('quantity').isInt({ min: 0 })]), ctrl.updateCartItem)
router.delete('/items/:itemId', ctrl.removeCartItem)
router.delete('/', ctrl.clearCart)

export { router }
```

- [ ] **Step 3: Mount** (`router.use('/cart', cartRouter)`) + Lint + Commit `feat(cart): server-side cart per user (qty clamps to stock)`

---

### Task 18: wishlist controller + routes

**Files:** Create `src/controllers/wishlist.controller.js`, `src/routes/wishlist.routes.js`; mount

- [ ] **Step 1: controller** — get/toggle/remove/clear.

```js
import { Wishlist } from '../models/Wishlist.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

async function getWishlist(userId) {
  let w = await Wishlist.findOne({ user: userId })
  if (!w) w = await Wishlist.create({ user: userId, products: [] })
  return w
}

export const getMyWishlist = asyncHandler(async (req, res) => {
  const w = await getWishlist(req.user._id)
  await w.populate('products', 'name price slug images ratingAvg')
  res.json({ success: true, data: w })
})

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body
  if (!(await Product.exists({ _id: productId, isActive: true }))) throw ApiError.notFound('Product not found')
  const w = await getWishlist(req.user._id)
  const i = w.products.findIndex((p) => p.toString() === productId)
  const added = i === -1
  if (added) w.products.push(productId)
  else w.products.splice(i, 1)
  await w.save()
  res.json({ success: true, data: { added, wishlist: w } })
})

export const removeWishlistItem = asyncHandler(async (req, res) => {
  const w = await getWishlist(req.user._id)
  w.products = w.products.filter((p) => p.toString() !== req.params.productId)
  await w.save()
  res.json({ success: true, data: w })
})

export const clearWishlist = asyncHandler(async (req, res) => {
  const w = await getWishlist(req.user._id)
  w.products = []
  await w.save()
  res.json({ success: true, data: w })
})
```

- [ ] **Step 2: routes** (all auth) — GET `/`, POST `/items { productId }`, DELETE `/items/:productId`, DELETE `/`.
- [ ] **Step 3: Mount** + Lint + Commit `feat(wishlist): per-user wishlist (toggle/remove/clear)`

---

### Task 19: orders controller + routes (FIXED flow)

**Files:** Create `src/controllers/order.controller.js`, `src/routes/order.routes.js`; mount

- [ ] **Step 1: controller** — the fixed create: validate stock, recompute total server-side, decrement atomically, snapshot price; list/get (owner or admin); status update (admin).

```js
import mongoose from 'mongoose'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Cart } from '../models/Cart.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body
  if (!Array.isArray(items) || items.length === 0) throw ApiError.badRequest('Order must include items')

  const session = await mongoose.startSession()
  let order
  try {
    await session.withTransaction(async () => {
      // Validate every item + snapshot price + decrement stock atomically.
      const lineItems = []
      let totalAmount = 0
      for (const it of items) {
        const product = await Product.findById(it.product).session(session)
        if (!product || !product.isActive) throw ApiError.notFound(`Product not found: ${it.product}`)
        const qty = Number(it.quantity)
        if (product.stock < qty) throw ApiError.conflict(`Insufficient stock for ${product.name}`)

        // Atomic conditional decrement (fails if stock dropped mid-flight).
        const updated = await Product.updateOne(
          { _id: product._id, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { session },
        )
        if (updated.modifiedCount !== 1) throw ApiError.conflict(`Stock changed for ${product.name}, retry`)

        lineItems.push({ product: product._id, quantity: qty, price: product.price })
        totalAmount += product.price * qty
      }
      order = await Order.create([{
        user: req.user._id, items: lineItems, totalAmount,
        shippingAddress, paymentMethod,
      }], { session })
      order = order[0]
    })
  } finally {
    session.endSession()
  }

  // Clear the user's cart on success.
  await Cart.updateOne({ user: req.user._id }, { items: [] })

  res.status(201).json({ success: true, data: order })
})

export const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id }
  const orders = await Order.find(filter).populate('items.product', 'name slug images').sort('-createdAt')
  res.json({ success: true, data: orders })
})

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name slug images')
  if (!order) throw ApiError.notFound('Order not found')
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not your order')
  }
  res.json({ success: true, data: order })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body
  const order = await Order.findById(req.params.id)
  if (!order) throw ApiError.notFound('Order not found')
  if (status) order.status = status
  if (paymentStatus) order.paymentStatus = paymentStatus
  await order.save()
  res.json({ success: true, data: order })
})
```

- [ ] **Step 2: routes** — create (auth), list (auth), get (auth), status update (admin).
```js
import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/order.controller.js'

const router = Router()
router.use(authenticate)
router.post('/', validate([
  body('items').isArray({ min: 1 }),
  body('shippingAddress').isObject(),
  body('paymentMethod').optional().isIn(['card', 'cod', 'safepay']),
]), ctrl.createOrder)
router.get('/', ctrl.getOrders)
router.get('/:id', ctrl.getOrder)
router.patch('/:id/status', authorizeRoles('admin'), validate([
  body('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
]), ctrl.updateOrderStatus)

export { router }
```

- [ ] **Step 3: Mount** + Lint + Commit `feat(orders): create (stock-validating, server-computed total) + list/get/status`

---

### Task 20: users controller + routes (admin)

**Files:** Create `src/controllers/user.controller.js`, `src/routes/user.routes.js`; mount

- [ ] **Step 1: controller** — list (paginated), get, update (self or admin), delete (admin). Role changes admin-only.

```js
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

export const getUsers = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginateQuery(User, req.query, {})
  res.json({ success: true, data, pagination })
})

export const getUser = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not allowed')
  }
  const user = await User.findById(req.params.id)
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: user })
})

export const updateUser = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not allowed')
  }
  const updates = { ...req.body }
  // Only admins can change role.
  if (updates.role && req.user.role !== 'admin') delete updates.role
  // Never allow password update via this route (use reset flow).
  delete updates.password
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: user })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: { message: 'User deleted' } })
})
```

- [ ] **Step 2: routes** — list/admin-only; get/update self-or-admin; delete admin-only.
```js
import { Router } from 'express'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import * as ctrl from '../controllers/user.controller.js'

const router = Router()
router.get('/', authenticate, authorizeRoles('admin'), ctrl.getUsers)
router.get('/:id', authenticate, ctrl.getUser)
router.put('/:id', authenticate, ctrl.updateUser)
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.deleteUser)

export { router }
```

- [ ] **Step 3: Mount** + Lint + Commit `feat(users): admin list + self/admin get-update + admin delete`

---

### Task 21: upload middleware + wire image fields

**Files:** Create `src/middleware/upload.js`; (no commit on its own — fold into product route if needed; or commit standalone)

- [ ] **Step 1: src/middleware/upload.js** — multer, local disk, image-only, 5MB limit.

```js
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { ApiError } from '../utils/ApiError.js'

const UPLOAD_DIR = path.resolve('uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
  },
})

function fileFilter(_req, file, cb) {
  if (file.mimetype.startsWith('image/')) return cb(null, true)
  cb(new ApiError(400, 'Only image files are allowed'))
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })
export const uploadSingle = (field) => upload.single(field)
export const uploadMultiple = (field, max = 5) => upload.array(field, max)
```

- [ ] **Step 2: Serve /uploads statically in app.js** — add `app.use('/uploads', express.static('uploads'))` before `app.use('/api', apiRouter)`.

- [ ] **Step 3: Lint + Commit**

```bash
npm run lint
git add src/middleware/upload.js src/app.js
git commit -m "feat(upload): multer middleware (image-only, 5MB) + static /uploads"
```

---
## Milestone 5 — Payment + seed

### Task 22: SafePay payment service (gated)

**Files:** Create `src/services/payment.js`

- [ ] **Step 1: Implement** — lazy client; behind env flag. Exposes createCheckoutSession + verifySignature + verifyWebhook.

```js
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

let client = null
function getClient() {
  if (!env.safepay.configured) return null
  if (client) return client
  // Lazy import so the app boots even if the SDK isn't installed.
  // (We DO install it in Task 1, but the lazy import keeps payment fully
  // optional / behind the env flag.)
  const { Safepay } = require('@sfpy/node-sdk') // eslint-disable-line
  client = new Safepay({
    environment: env.safepay.environment,
    apiKey: env.safepay.apiKey,
    v1Secret: env.safepay.v1Secret,
    webhookSecret: env.safepay.webhookSecret,
  })
  return client
}

export function isPaymentConfigured() {
  return env.safepay.configured
}

/** Create a SafePay payment + checkout URL for an order. */
export async function createCheckoutSession({ orderId, amount, currency = 'PKR' }) {
  const sf = getClient()
  if (!sf) throw ApiError.notImplemented('SafePay is not configured. Add SAFEPAY_* keys to .env.')
  const { token } = await sf.payments.create({ amount: Math.round(amount * 100), currency })
  const url = sf.checkout.create({
    token,
    orderId: String(orderId),
    redirectUrl: `${env.clientUrl}/orders/${orderId}?paid=1`,
    cancelUrl: `${env.clientUrl}/orders/${orderId}?paid=0`,
    source: 'custom',
    webhooks: true,
  })
  return { token, url }
}

export function verifySignature(req) {
  const sf = getClient()
  if (!sf) return false
  return sf.verify.signature(req)
}

export async function verifyWebhook(req) {
  const sf = getClient()
  if (!sf) return false
  return sf.verify.webhook(req)
}
```

NOTE: Since the project is ESM, the `require()` inside `getClient()` won't work. Replace with a dynamic `await import('@sfpy/node-sdk')` and cache the module. Fix that during implementation:

```js
let SfpModule = null
async function getClient() {
  if (!env.safepay.configured) return null
  if (client) return client
  SfpModule = await import('@sfpy/node-sdk')
  client = new SfpModule.Safepay({ /* config */ })
  return client
}
```
And make `createCheckoutSession`/`verifyWebhook` await `getClient()`.

- [ ] **Step 2: Lint + Commit** `feat(services): SafePay payment service (gated behind env keys, ESM dynamic import)`

---

### Task 23: payment controller + routes

**Files:** Create `src/controllers/payment.controller.js`, `src/routes/payment.routes.js`; mount

- [ ] **Step 1: controller**

```js
import { Order } from '../models/Order.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createCheckoutSession, verifySignature, verifyWebhook, isPaymentConfigured } from '../services/payment.js'

export const createSafepaySession = asyncHandler(async (req, res) => {
  if (!isPaymentConfigured()) throw ApiError.notImplemented('SafePay not configured')
  const order = await Order.findById(req.params.orderId)
  if (!order) throw ApiError.notFound('Order not found')
  if (order.user.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not your order')
  if (order.paymentStatus === 'paid') throw ApiError.conflict('Order already paid')
  const session = await createCheckoutSession({ orderId: order._id, amount: order.totalAmount })
  res.json({ success: true, data: session })
})

export const safepayWebhook = asyncHandler(async (req, res) => {
  const valid = await verifyWebhook(req)
  if (!valid) throw ApiError.unauthorized('Invalid webhook signature')
  const trackerId = req.body?.tracker?.id
  const orderId = req.body?.metadata?.orderId
  if (orderId && trackerId) {
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', paymentRef: trackerId })
  }
  res.json({ success: true, data: { received: true } })
})

// Redirect targets after SafePay checkout.
export const safepaySuccess = asyncHandler(async (req, res) => {
  if (!verifySignature(req)) throw ApiError.unauthorized('Invalid signature')
  const orderId = req.query.order_id
  if (orderId) await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' })
  res.redirect(`${env.clientUrl}/orders/${orderId}?paid=1`)
})

export const safepayCancel = asyncHandler(async (req, res) => {
  const orderId = req.query.order_id
  res.redirect(`${env.clientUrl}/orders/${orderId}?paid=0`)
})
```
(import `env` from `../config/env.js` at top.)

- [ ] **Step 2: routes**
```js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as ctrl from '../controllers/payment.controller.js'

const router = Router()
router.post('/create-safepay-session/:orderId', authenticate, ctrl.createSafepaySession)
router.post('/safepay-webhook', ctrl.safepayWebhook) // SafePay server → no auth
router.get('/safepay-success', ctrl.safepaySuccess)
router.get('/safepay-cancel', ctrl.safepayCancel)

export { router }
```

- [ ] **Step 3: Mount** (`router.use('/payments', paymentRouter)`) + Lint + Commit `feat(payments): SafePay session/webhook/redirect endpoints (gated)`

---

### Task 24: seed data (categories, users, products)

**Files:** Create `src/seed/categories.seed.js`, `src/seed/users.seed.js`, `src/seed/products.seed.js`

> The products must mirror the frontend's `frontend/src/data/products.js` (50 products). Read that file during implementation to copy names/slugs/prices/stock/categories/tags exactly, mapping the free-text `category` strings to the new category slugs.

- [ ] **Step 1: categories.seed.js** — export array of 8 categories (Phones→phones, Computers→computers, Audio/HeadPhones→audio, Wearables→wearables, Cameras→cameras, Gaming→gaming, Accessories→accessories, Home & Lifestyle→home-lifestyle). Each `{ name, slug, description }`.

- [ ] **Step 2: users.seed.js** — export array of 2 users: admin `{ name:'Store Admin', email:'admin@exclusive.test', password:'Admin123!', role:'admin', isEmailVerified:true }`, customer `{ name:'Jane Customer', email:'customer@exclusive.test', password:'Customer123!', role:'customer', isEmailVerified:true }`.

- [ ] **Step 3: products.seed.js** — export array of ~50 products mirroring the frontend data. Map each product's `category` string to a category `slug` (e.g. `"HeadPhones"` → `audio`). Each `{ name, slug, price, originalPrice, brand, images, stock, category(slug), colors, sizes, tags, isActive:true }`. Add `createdAt` spread across the last 6 months so `newest` sort looks real.

- [ ] **Step 4: Lint + Commit** `feat(seed): seed data (categories, 2 users, ~50 products mirroring frontend)`

---

### Task 25: seed script

**Files:** Create `src/seed/seed.js`

- [ ] **Step 1: Implement**

```js
import { connectDB, disconnectDB } from '../config/db.js'
import { env } from '../config/env.js'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { Review } from '../models/Review.js'
import { Cart } from '../models/Cart.js'
import { Wishlist } from '../models/Wishlist.js'
import { Order } from '../models/Order.js'
import { categories } from './categories.seed.js'
import { users } from './users.seed.js'
import { products } from './products.seed.js'

async function wipe() {
  await Promise.all([
    Category.deleteMany({}), Product.deleteMany({}), User.deleteMany({}),
    Review.deleteMany({}), Cart.deleteMany({}), Wishlist.deleteMany({}), Order.deleteMany({}),
  ])
  console.log('[seed] wiped collections')
}

async function seed() {
  await connectDB()
  console.log('[seed] starting…')

  // Require --force unless NODE_ENV=production is explicitly NOT set? Simplest: require --force.
  if (!process.argv.includes('--force')) {
    console.error('[seed] this will wipe the database. Re-run with --force to confirm.')
    process.exit(1)
  }

  await wipe()

  const [catDocs, userDocs] = await Promise.all([
    Category.insertMany(categories),
    User.insertMany(users),
  ])
  console.log(`[seed] ${catDocs.length} categories, ${userDocs.length} users`)

  // Map product category slug → _id.
  const catBySlug = Object.fromEntries(catDocs.map((c) => [c.slug, c._id]))
  const productsWithCat = products.map((p) => ({ ...p, category: catBySlug[p.category] || catBySlug['home-lifestyle'] }))
  const productDocs = await Product.insertMany(productsWithCat)
  console.log(`[seed] ${productDocs.length} products`)

  // A few sample reviews.
  const reviews = []
  for (const p of productDocs.slice(0, 6)) {
    reviews.push({ product: p._id, user: userDocs[1]._id, rating: 4 + (p.name.length % 2), title: 'Great', body: 'Exactly as described.' })
  }
  await Review.insertMany(reviews)
  console.log(`[seed] ${reviews.length} reviews`)

  console.log('[seed] done.')
  console.log('  Admin login:    admin@exclusive.test / Admin123!')
  console.log('  Customer login: customer@exclusive.test / Customer123!')
  await disconnectDB()
}

seed().catch((e) => { console.error('[seed] failed:', e); process.exit(1) })
```

- [ ] **Step 2: Test the seed locally**

Run: `npm run seed -- --force` (requires `.env` with a valid `MONGO_URI`). Expect the success log.

- [ ] **Step 3: Lint + Commit** `feat(seed): runnable seed script (--force guarded, mirrors frontend data)`

---

## Milestone 6 — Tests + verify

### Task 26: test setup (mongodb-memory-server)

**Files:** Create `tests/setup.js`

- [ ] **Step 1: Implement** — spin up an in-memory **single-node replica set**, swap `env.mongoUri` before connect, clear collections between tests, teardown after all.

> **Why a replica set (not `MongoMemoryServer`):** `POST /orders` intentionally uses a Mongo transaction for atomic stock decrement + order creation. Mongo transactions require a replica set; a plain standalone memory server rejects `session.withTransaction()`.

```js
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { connectDB, disconnectDB } from '../src/config/db.js'

let mongoReplSet

beforeAll(async () => {
  mongoReplSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } })
  const uri = mongoReplSet.getUri()
  process.env.MONGO_URI = uri
  await connectDB(uri)
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await disconnectDB()
  if (mongoReplSet) await mongoReplSet.stop()
})
```

NOTE: env.js validates secrets at import time. Set test secrets in `vitest.config.js` via `define` or set them in `process.env` before importing. Simplest: create `tests/setup.env.js` that sets `process.env.JWT_ACCESS_SECRET` etc. BEFORE anything else, or use vitest's `env` setup. Add a small `tests/_env.js` imported first:

```js
// tests/_env.js — MUST be the first import in setup.js
process.env.MONGO_URI = 'placeholder' // replaced by memory server at runtime
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32-chars-or-more!!'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-or-more!'
process.env.JWT_EMAIL_SECRET = 'test-email-secret-32-chars-or-more!!'
process.env.NODE_ENV = 'test'
```
Then `setup.js` first line: `import './_env.js'`.

- [ ] **Step 2: Commit** `test(setup): mongodb-memory-server + per-test wipe + test env`

---

### Task 27: auth tests

**Files:** Create `tests/auth.test.js`

- [ ] **Step 1: Implement** — register/login/refresh-rotation/reuse-detection/logout using supertest against the exported `app`.

```js
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { User } from '../src/models/User.js'

describe('auth', () => {
  it('registers a user, sets refresh cookie, returns access token', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Test', email: 'test@x.test', password: 'pass1234' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeTruthy()
    expect(res.body.data.user.email).toBe('test@x.test')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('rejects duplicate email', async () => {
    await User.create({ name: 'X', email: 'dup@x.test', password: 'pass1234' })
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Y', email: 'dup@x.test', password: 'pass1234' })
    expect(res.status).toBe(409)
  })

  it('logs in with valid credentials', async () => {
    await User.create({ name: 'X', email: 'login@x.test', password: 'pass1234' })
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'login@x.test', password: 'pass1234' })
    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeTruthy()
  })

  it('rotates refresh token; reuse of old token is rejected', async () => {
    const reg = await request(app).post('/api/auth/register')
      .send({ name: 'R', email: 'rot@x.test', password: 'pass1234' })
    const cookies = reg.headers['set-cookie']
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='))
    // First refresh — succeeds, rotates.
    const r1 = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie)
    expect(r1.status).toBe(200)
    // Reuse the OLD cookie — must be rejected (reuse detected).
    const r2 = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie)
    expect(r2.status).toBe(401)
  })

  it('rejects login with wrong password', async () => {
    await User.create({ name: 'X', email: 'wrong@x.test', password: 'pass1234' })
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'wrong@x.test', password: 'WRONG' })
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run** — `npm test -- tests/auth.test.js` → all pass.
- [ ] **Step 3: Commit** `test(auth): register/login/refresh-rotation/reuse/wrong-password`

---

### Task 28: product tests

**Files:** Create `tests/product.test.js`

- [ ] **Step 1: Implement** — seed a category + a few products; test list pagination, filter by category, search, admin create requires auth + validates.

```js
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'

async function seedProducts() {
  const cat = await Category.create({ name: 'Audio', slug: 'audio' })
  await Product.insertMany([
    { name: 'Headset A', slug: 'headset-a', price: 100, category: cat._id, stock: 5, isActive: true },
    { name: 'Headset B', slug: 'headset-b', price: 200, category: cat._id, stock: 3, isActive: true },
    { name: 'Hidden', slug: 'hidden', price: 50, category: cat._id, stock: 1, isActive: false },
  ])
  return cat
}

describe('products', () => {
  it('lists active products paginated', async () => {
    await seedProducts()
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(2) // active only
    expect(res.body.pagination).toBeDefined()
  })

  it('filters by category slug', async () => {
    const cat = await seedProducts()
    const res = await request(app).get(`/api/products?category=${cat.slug}`)
    expect(res.body.data.length).toBe(2)
  })

  it('searches by name', async () => {
    await seedProducts()
    const res = await request(app).get('/api/products?search=headset-a')
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].slug).toBe('headset-a')
  })

  it('requires auth for admin create', async () => {
    const cat = await seedProducts()
    const res = await request(app).post('/api/products').send({ name: 'X', price: 10, category: cat._id })
    expect(res.status).toBe(401)
  })

  it('rejects invalid input (422)', async () => {
    const cat = await seedProducts()
    // login as admin first
    const reg = await request(app).post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@x.test', password: 'pass1234' })
    await require('../src/models/User.js').User.findByIdAndUpdate(reg.body.data.user.id, { role: 'admin' })
    const token = reg.body.data.accessToken
    const res = await request(app).post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: -5, category: cat._id }) // missing name + negative price
    expect(res.status).toBe(422)
  })
})
```
(import `User` properly — replace the inline `require` with the static import at top.)

- [ ] **Step 2: Run + Commit** `test(products): list/paginate/filter/search + auth + validation`

---

### Task 29: cart + order tests

**Files:** Create `tests/cart.test.js`, `tests/order.test.js`

- [ ] **Step 1: cart.test.js** — add clamps to stock, update/remove.

```js
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'
import { User } from '../src/models/User.js'

async function authUser() {
  const reg = await request(app).post('/api/auth/register')
    .send({ name: 'C', email: 'c@x.test', password: 'pass1234' })
  return reg.body.data.accessToken
}

describe('cart', () => {
  it('adds an item and clamps quantity to stock', async () => {
    const token = await authUser()
    const cat = await Category.create({ name: 'Gaming', slug: 'gaming' })
    const product = await Product.create({ name: 'Pad', slug: 'pad', price: 50, category: cat._id, stock: 2, isActive: true })
    const res = await request(app).post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.id, quantity: 5 })
    expect(res.status).toBe(200)
    expect(res.body.data.items[0].quantity).toBe(2) // clamped
  })
})
```

- [ ] **Step 2: order.test.js** — create decrements stock, recomputes total server-side, rejects oversold.

```js
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { Category } from '../src/models/Category.js'
import { Product } from '../src/models/Product.js'

async function authUser() {
  const reg = await request(app).post('/api/auth/register')
    .send({ name: 'O', email: 'o@x.test', password: 'pass1234' })
  return reg.body.data.accessToken
}

describe('orders', () => {
  it('creates an order, recomputes total server-side, decrements stock', async () => {
    const token = await authUser()
    const cat = await Category.create({ name: 'C', slug: 'c' })
    const product = await Product.create({ name: 'Item', slug: 'item', price: 30, category: cat._id, stock: 5, isActive: true })
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      items: [{ product: product.id, quantity: 2 }],
      shippingAddress: { street: '1 St', city: 'C', zip: 'Z', country: 'PK' },
      paymentMethod: 'cod',
    })
    expect(res.status).toBe(201)
    expect(res.body.data.totalAmount).toBe(60) // 2 * 30, server-computed
    const updated = await Product.findById(product.id)
    expect(updated.stock).toBe(3) // decremented
  })

  it('rejects oversold orders', async () => {
    const token = await authUser()
    const cat = await Category.create({ name: 'C2', slug: 'c2' })
    const product = await Product.create({ name: 'Rare', slug: 'rare', price: 10, category: cat._id, stock: 1, isActive: true })
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({
      items: [{ product: product.id, quantity: 5 }],
      shippingAddress: { street: '1', city: 'c', zip: 'z', country: 'PK' },
    })
    expect(res.status).toBe(409) // insufficient stock
  })
})
```

- [ ] **Step 3: Run all** — `npm test` → expect all suites green.
- [ ] **Step 4: Commit** `test(cart+orders): stock clamp, server-computed total, atomic decrement, oversold rejection`

---

### Task 30: README + final gate

**Files:** `README.md`; final verification

- [ ] **Step 1: Write README.md** — project name, what it is, stack, setup (`cp .env.example .env` + fill secrets + `npm i`), scripts (`dev`, `start`, `seed --force`, `test`, `lint`), endpoint summary table by resource, security checklist, SafePay setup note, link to the spec.

- [ ] **Step 2: Final gate** — run and confirm:
  - `npm run lint` → 0 problems
  - `npm test` → all green
  - `npm run dev` boots, `/api/health` returns 200
  - `npm run seed -- --force` populates (if a Mongo is available; otherwise note in README)
  - `grep -rn "console.log" src/` → only acceptable dev logs (env warnings, seed, email dev fallback)
  - `.env` is NOT in git (`git ls-files | grep "^\.env$"` → empty)

- [ ] **Step 3: Commit** `docs: backend README + setup/scripts/endpoints`

---

## Done — Acceptance Criteria check

Confirm against spec §12:
- [ ] `npm run dev` boots; `/api/health` 200.
- [ ] env.js fails fast on missing secrets.
- [ ] Auth: register/login/refresh(rotation+reuse)/logout/verify/forgot/reset work.
- [ ] All 8 models exist with correct schemas.
- [ ] Products list filter/sort/paginate/search; admin CRUD gated.
- [ ] Cart + Wishlist + Reviews per-user CRUD.
- [ ] Order create recomputes total + decrements stock atomically; oversold rejected.
- [ ] SafePay service + routes exist; 501 when unconfigured.
- [ ] Seed script populates admin + customer + ~50 products.
- [ ] `npm test` passes (auth, product, cart, order suites).
- [ ] Security checklist (spec §4) implemented.
- [ ] `npm run lint` clean.
- [ ] Zero `.env` in git.

**Phase B complete.** Phase C (frontend ↔ backend integration) is a separate spec → plan cycle.

<!-- END OF PLAN -->
