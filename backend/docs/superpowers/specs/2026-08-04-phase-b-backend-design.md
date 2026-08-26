# Phase B — Backend Design Spec

- **Date:** 2026-08-04
- **Sub-project:** B of 3 (A: UI Overhaul ✅ → **B: Backend** → C: Integration)
- **Target:** `E-Commerce MERN Project/backend/` (new, sibling to `frontend/`)
- **Status:** Approved (2026-08-04)

---

## 1. Purpose & Scope

Build a production-grade REST API for the Exclusive storefront: a Node.js + Express + MongoDB backend that provides auth, products, categories, reviews, cart, wishlist, and orders — plus a SafePay payment integration layer.

### In scope
- Express 5 + Mongoose 9 + JWT auth (access + refresh tokens, cookie-based refresh)
- 8 models: User, Category, Product, Review, Cart, Wishlist, Order, PasswordReset
- Full endpoint suite (auth, users, products, categories, reviews, cart, wishlist, orders, payments)
- Security hardening: bcrypt(12), refresh-token rotation, httpOnly cookies, express-validator, rate limiting, helmet, CORS allowlist, env-fail-fast
- Seed script (admin + customer + ~50 products mirroring frontend data)
- Vitest + supertest endpoint tests
- SafePay integration layer (built but gated behind env keys — COD-only until sandbox keys added)
- Email (verify + password reset) via nodemailer/Mailtrap

### Out of scope (Phase C)
- Frontend ↔ backend wiring (RTK Query, real auth/checkout in the UI)
- Image upload to cloud storage (local disk only this phase)
- Real SafePay live keys (sandbox-ready only)
- Admin dashboard UI (frontend concern)

### Non-goals
- TypeScript (stays plain JS/ESM)
- Microservices / Docker / CI (single deployable)

---

## 2. Stack & Conventions

- **Runtime:** Node.js ≥ 20
- **Module system:** ES Modules (`"type": "module"`)
- **Framework:** Express 5
- **ODM:** Mongoose 9
- **Auth:** jsonwebtoken (access 15m, refresh 7d), bcryptjs (12 rounds)
- **Validation:** express-validator
- **Security:** helmet, express-rate-limit, express-xss-sanitizer, cookie-parser, cors (allowlist)
- **Upload:** multer (local disk → `uploads/`, gitignored)
- **Email:** nodemailer (Mailtrap for dev)
- **Logs:** pino + pino-http
- **Payment:** `@sfpy/node-sdk` (SafePay; behind env flag)
- **Test:** vitest + supertest + mongodb-memory-server

**Conventions:**
- `asyncHandler(fn)` wraps controllers (no hand-written try/catch everywhere)
- `ApiError(status, message)` thrown → centralized `errorHandler` middleware
- Standard response envelope: `{ success: true, data }` / `{ success: false, error: { code, message, details? } }`
- All routes under `/api`, all auth-gated routes use `authenticate` middleware, admin routes add `authorizeRoles('admin')`

---

## 3. Folder Structure

```
backend/
├── src/
│   ├── app.js                 # express app (middleware order, routes, error handler)
│   ├── server.js              # bootstrap: validate env → connectDB → listen
│   ├── config/
│   │   ├── env.js             # validates + freezes env, fails fast on missing secrets
│   │   ├── db.js              # mongoose connect
│   │   └── cors.js            # allowed origins from env
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   ├── Cart.js
│   │   ├── Wishlist.js
│   │   ├── Order.js
│   │   └── PasswordReset.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── review.controller.js
│   │   ├── cart.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── order.controller.js
│   │   └── payment.controller.js
│   ├── routes/
│   │   ├── index.js           # mounts all routers under /api
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── review.routes.js
│   │   ├── cart.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── order.routes.js
│   │   └── payment.routes.js
│   ├── middleware/
│   │   ├── auth.js            # authenticate, authorizeRoles
│   │   ├── validate.js        # express-validator result checker
│   │   ├── error.js           # notFound + errorHandler
│   │   └── upload.js          # multer
│   ├── services/
│   │   ├── token.js           # signAccess, signRefresh, verify, rotate
│   │   ├── email.js           # nodemailer transport + templates
│   │   └── payment.js         # SafePay create session + verify signature/webhook
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── queryService.js    # salvaged + cleaned from mock
│   │   └── logger.js          # pino
│   └── seed/
│       ├── seed.js            # entry: wipe → insert → log
│       ├── users.seed.js      # 1 admin + 1 customer
│       ├── products.seed.js   # ~50 products mirroring frontend
│       └── categories.seed.js
├── tests/
│   ├── setup.js               # mongodb-memory-server beforeAll/afterAll
│   ├── auth.test.js
│   ├── product.test.js
│   ├── cart.test.js
│   └── order.test.js
├── .env.example
├── .gitignore
├── package.json
├── eslint.config.js
├── vitest.config.js
└── README.md
```

---

## 4. Security Model

| Concern | Implementation |
|---|---|
| **Access token** | JWT 15m, payload `{ id, role }`, returned in login/register/refresh JSON `data.accessToken`. Frontend keeps in memory (Phase C). |
| **Refresh token** | Separate JWT 7d, payload `{ id }`. Stored in **`httpOnly` + `SameSite=Lax` + `Secure`(prod)` cookie** named `refreshToken`. Hashed (`User.refreshTokenHash`) — one active refresh per user. **Rotated on each `/auth/refresh`**; reuse of an old token revokes the whole family (sets hash to null → forced re-login). |
| **Password hashing** | bcryptjs, 12 salt rounds, pre-save hook. `comparePassword` instance method. `password` field `select:false`. |
| **Self-register as admin** | **FIXED.** `role` is always forced to `'customer'` on register; only an admin can change another user's role. |
| **JWT secrets** | **No fallback.** `config/env.js` throws on boot if `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, or `JWT_EMAIL_SECRET` are missing/weak. |
| **Input validation** | express-validator schemas on every write endpoint. `validate` middleware returns 422 with field-level details. |
| **Rate limiting** | Global limiter (100 req / 15 min / IP). Stricter auth limiter on `/api/auth/login`, `/register`, `/forgot-password`: 5 / 15 min / IP. |
| **CORS** | Allowlist from `ALLOWED_ORIGINS` env (comma-sep). `credentials: true`. |
| **Cookies** | `cookie-parser` loaded (mock forgot it despite `credentials:true`). |
| **Security headers** | `helmet()` with CSP tuned for an API. |
| **XSS** | `express-xss-sanitizer` on body. |
| **NoSQL injection** | express-validator `escape` + mongoose strictQuery + sanitize known operator keys. |
| **Secrets in repo** | **`.env.example` only.** `.gitignore` excludes `.env`, `uploads/`, `node_modules`, logs. |
| **Committed secrets (mock)** | NOT copied. **WARNING:** the original `Backend-Mock/.env` contains live Mongo Atlas + JWT + Mailtrap credentials — treat as compromised, rotate them. |

---

## 5. Data Models

### User
```
name        String required trim
email       String required unique lowercase trim (regex)
password    String required minlength 6 select:false
role        enum['customer','admin'] default 'customer'
phone       String trim
addresses   [{ label, street, city, state, zip, country }]
isEmailVerified      Boolean default false
refreshTokenHash     String select:false   // bcrypt hash of current refresh token
timestamps
pre-save: hash password if modified (12 rounds)
method comparePassword(candidate): boolean
```

### Category
```
name        String required unique trim
slug        String unique lowercase     // auto-generated, collision-safe
description String trim
image       String
parent      ObjectId ref Category default null
timestamps
```

### Product
```
name         String required trim
slug         String unique lowercase     // auto-generated
description  String trim
price        Number required min 0
originalPrice Number min 0
comparePrice Number  // alias for filtering
category     ObjectId ref Category required
brand        String trim
images       [String]
stock        Number default 0 min 0
sku          String unique sparse trim
colors       [{ name, value }]
sizes        [String]
tags         [String]          // 'featured','todays-deal','bestseller','new'
isActive     Boolean default true
ratingAvg    Number default 0
ratingCount  Number default 0
timestamps
text index: { name, description, brand }
```

### Review
```
product  ObjectId ref Product required
user     ObjectId ref User required
rating   Number required min 1 max 5
title    String trim
body     String trim
timestamps
unique compound: [product, user]    // one review per user per product
post-save / post-remove hooks: recompute Product.ratingAvg + ratingCount via aggregation
```

### Cart (server-side, one per user)
```
user   ObjectId ref User required unique
items  [{ product ObjectId ref Product required, quantity Number min 1 default 1, color String, size String }]
timestamps
```

### Wishlist (one per user)
```
user     ObjectId ref User required unique
products [ObjectId ref Product]
timestamps
```

### Order
```
user            ObjectId ref User required
items           [{ product ObjectId ref Product required, quantity Number min 1, price Number required }]
                // price = snapshot of product price at order time
totalAmount     Number required min 0    // server-recomputed, never trusted from client
status          enum['pending','processing','shipped','delivered','cancelled'] default 'pending'
shippingAddress { street, city, state, zip, country } required
paymentMethod   enum['card','cod','safepay'] default 'cod'
paymentStatus   enum['pending','paid','failed','refunded'] default 'pending'
paymentRef      String                   // SafePay tracker id once paid
timestamps
```

### PasswordReset
```
user      ObjectId ref User required
tokenHash String required                // bcrypt hash
expiresAt Date required                  // 10 min
used      Boolean default false
timestamps
```

---

## 6. Auth Flows

**Register:** validate name/email/password → check email not taken → force `role:'customer'` → hash password → create user → sign access + refresh → **store refresh hash on user** → set refresh cookie → send verification email → return `{ user(sans password), accessToken }`.

**Login:** validate email/password → find user `+password` → `comparePassword` → (optional) require `isEmailVerified` → sign tokens → hash+store refresh → set cookie → return `{ user, accessToken }`.

**Refresh:** read `refreshToken` cookie → verify JWT → compare hash against `user.refreshTokenHash` (mismatch = reuse attack → clear hash, 401) → **rotate**: sign new refresh, hash+store, set new cookie → return new access.

**Logout:** clear `refreshToken` cookie + set `user.refreshTokenHash = null`.

**Verify email:** `GET /auth/verify-email?token=` → decode email JWT → set `isEmailVerified:true`.

**Forgot password:** `POST /auth/forgot-password { email }` → always 200 (don't leak existence) → if user exists: create `PasswordReset` with hashed random token, email link `FRONTEND_URL/reset-password?token=`.

**Reset password:** `POST /auth/reset-password { token, password }` → find PasswordReset by hash → not expired/used → set user password (pre-save hashes) → mark used.

---

## 7. Order Flow (the fixed version)

The mock trusted the client's `totalAmount` and didn't touch stock. Fixed:

1. `POST /api/orders { items, shippingAddress, paymentMethod }` (auth)
2. Server fetches each `Product` by id, validates it exists + `isActive` + has `stock ≥ quantity`
3. Server **recomputes `totalAmount`** from DB prices (ignores any client-sent total)
4. Server **atomically decrements stock** (using `Product.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })` — fails safely if stock dropped mid-flight)
5. Creates Order with `items[].price` snapshotted from DB
6. If `paymentMethod === 'safepay'`: returns order + a SafePay checkout URL (frontend redirects). Webhook/SafePay-success sets `paymentStatus:'paid'`.
7. If `cod`: Order created as-is (`paymentStatus:'pending'`).
8. Returns order. Clears the user's Cart on success.

---

## 8. SafePay Payment (built, gated)

- `services/payment.js`: `createCheckoutSession({ orderId, amount, currency })` → `safepay.payments.create` → `safepay.checkout.create` → returns URL. `verifySignature(req)` + `verifyWebhook(req)` wrappers.
- `POST /api/payments/create-safepay-session` (auth) — creates session for an existing unpaid order.
- `POST /api/payments/safepay-webhook` — SafePay server → verify → mark order `paymentStatus:'paid'`, store tracker id.
- `GET /api/payments/safepay-success` / `/safepay-cancel` — redirect targets (frontend URLs).
- **Gated:** if `SAFEPAY_API_KEY` is unset, `create-safepay-session` returns 501 `'SafePay not configured'`. COD flow works regardless. Sandbox keys can be added in `.env` without code changes.

---

## 9. Pagination / filtering / sorting (public GET endpoints)

Salvaged `queryService.js` from the mock (it's high quality) — adapted to ESM. Supports:
- `?search=` (against text index)
- `?category=<slug>` `?brand=` `?tags=`
- `?price[gte]=` `?price[lte]=`
- `?sort=price-asc|price-desc|rating|newest`
- `?page=` `?limit=` (default 12, max 100)
- `?fields=` field-limiting

Returns `{ data, pagination: { page, limit, total, pages } }`.

---

## 10. Seed Script

`npm run seed`:
1. Connects to DB (env `MONGO_URI`)
2. Wipes `users, products, categories, reviews, carts, wishlists, orders` (with `--force` flag required; otherwise prompts)
3. Inserts categories (8: Phones, Computers, Audio, Wearables, Cameras, Gaming, Accessories, Home & Lifestyle)
4. Inserts 1 admin (`admin@exclusive.test` / `Admin123!`) + 1 customer (`customer@exclusive.test` / `Customer123!`)
5. Inserts ~50 products mirroring `frontend/src/data/products.js` (same names/slugs/prices, mapped to category slugs)
6. Inserts sample reviews
7. Logs summary + exits

---

## 11. Testing

- **`tests/setup.js`**: `mongodb-memory-server` started beforeAll, connect mongoose; afterAll disconnect + kill.
- **`tests/auth.test.js`**: register → 201 + cookie; login; refresh rotation; reuse detection; logout clears cookie.
- **`tests/product.test.js`**: public list w/ pagination; filter by category; search; admin create requires auth; invalid input 422.
- **`tests/cart.test.js`**: add/update/remove items; qty clamps to stock.
- **`tests/order.test.js`**: create decrements stock; rejects oversold; recomputes total; COD order status pending.

---

## 12. Acceptance Criteria (Phase B done when…)

- [ ] `npm run dev` boots; `/api/health` returns 200.
- [ ] `env.js` fails fast on any missing secret.
- [ ] Auth flow: register/login/refresh/logout/verify/forgot/reset all work; refresh rotates + reuse is detected.
- [ ] All 9 model files exist with the schemas above.
- [ ] Products list supports filter/sort/search/paginate; admin CRUD gated.
- [ ] Cart + Wishlist + Reviews CRUD per-user.
- [ ] Order create recomputes total + decrements stock atomically; oversold rejected.
- [ ] SafePay service compiles + routes exist; returns 501 when unconfigured.
- [ ] `npm run seed` populates DB with admin + customer + ~50 products.
- [ ] `npm test` passes (vitest + supertest, in-memory Mongo).
- [ ] Security checklist (§4) all implemented + verified.
- [ ] `npm run lint` clean.
- [ ] Zero `.env` in git; `.gitignore` correct.

---

## 13. References

- SafePay docs: https://safepay-docs.netlify.app/
- SafePay Node SDK: https://github.com/getsafepay/safepay-node
- SafePay API ref: https://apidocs.getsafepay.com/
- JWT best practices (short access + rotating refresh): RFC 6749 §10.4, OAuth 2.0 BCP
- Express 5 migration: https://expressjs.com/en/guide/migrating-5.html
- OWASP API Top 10 (auth, object-level authz, rate limit, validation)
