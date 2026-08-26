# Exclusive Backend API

REST API for the Exclusive e-commerce storefront. It provides account sessions, catalog and category browsing, reviews, carts and wishlists, transaction-safe ordering, and an optional SafePay checkout integration.

## Stack

- Node.js 20+ and Express 5
- MongoDB with Mongoose
- JWT, bcrypt, HTTP-only refresh cookies
- Helmet, CORS, XSS sanitization, request/auth rate limits
- SafePay SDK (optional)
- Vitest, Supertest, and `mongodb-memory-server` replica sets

## Setup

```bash
# Node.js 20 or newer is required
npm install
cp .env.example .env
npm run dev
```

Set `MONGO_URI` in `.env` to a running MongoDB deployment before starting the API. Keep the required JWT secrets private and use long random values in production. Tests create their own in-memory MongoDB replica set, so no local MongoDB is required for `npm test`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon. |
| `npm start` | Start the API normally. |
| `npm test` | Run the integration suite against an in-memory MongoDB replica set. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run lint` | Lint all backend files. |
| `npm run seed -- --force` | Wipe the configured database and load demo data. |

## API surface

All API routes are prefixed with `/api`.

| Area | Endpoints | Notes |
| --- | --- | --- |
| Health | `GET /health` | Service health and environment status. |
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, email verification and password reset routes | Customer accounts and session lifecycle. |
| Products | `/products` | Public active-product catalog; admin product management. |
| Categories | `/categories` | Public category listing; admin management. |
| Reviews | `/products/:productId/reviews`, `/reviews/:id` | Authenticated review creation and ownership/admin moderation. |
| Cart | `/cart`, `/cart/items` | Authenticated cart retrieval, add, update, remove, and clear. Quantities are capped at available inventory. |
| Wishlist | `/wishlist`, `/wishlist/:productId` | Authenticated wishlist operations. |
| Orders | `/orders`, `/orders/:id`, `/orders/:id/status` | Authenticated checkout and history; admin status updates. Server snapshots prices, computes totals, and atomically decrements stock. |
| Payments | `/payments/create-safepay-session/:orderId`, SafePay webhook and redirect routes | SafePay checkout only when configured. |

## Authentication semantics

Successful registration and login return a **15-minute access token** in JSON. They also set a **7-day refresh token** in an `HttpOnly`, `SameSite=Lax` cookie scoped to `/api/auth`.

Send access tokens as `Authorization: Bearer <token>`. Refresh tokens rotate on every `/api/auth/refresh` request. The server tracks their `jti` and hash; reuse of an old token revokes the session family and requires a new login. Self-registration always creates a customer account—roles are never accepted from the client.

## Security and ordering

The API uses Helmet headers, configured CORS, JSON size limits, XSS sanitization, disabled `X-Powered-By`, validation middleware, and global plus authentication rate limiting. Both rate limiters intentionally skip the `test` environment so integration tests remain deterministic.

Order totals never trust a request's `totalAmount`. Orders run inside a MongoDB transaction, snapshot the current product price, conditionally decrement each item’s inventory, and reject insufficient stock with `409 Conflict`; an unsuccessful transaction leaves stock unchanged.

## SafePay

SafePay is deliberately disabled unless both `SAFEPAY_API_KEY` and `SAFEPAY_V1_SECRET` are set. Leave them empty for COD-only development. An authenticated SafePay-session request returns `501 SafePay not configured` before any order lookup when credentials are absent. Configure `SAFEPAY_ENVIRONMENT` and `SAFEPAY_WEBHOOK_SECRET` as appropriate for the deployment, and validate webhook traffic before marking orders paid.

## Seed data

The seed command loads categories, two demo users, reviews, and **50 products mirroring the frontend catalog**. It calls model `create` for users and reviews so their password hashing and rating hooks run.

```bash
npm run seed -- --force
```

Warning: this command deletes the configured database collections before seeding. Confirm `MONGO_URI` points to a disposable development database—never run it against production.

## Testing

```bash
npm test
```

The suite uses `MongoMemoryReplSet`, specifically allowing transaction coverage for order creation, stock decrementing, and oversold-order rollback behavior.

## Phase C roadmap

- Add payment reconciliation, refund workflows, and richer order fulfillment events.
- Add inventory reservations, idempotent checkout keys, and multi-item concurrency tests.
- Add API versioning, OpenAPI documentation, and CI coverage reporting.
- Add object storage for uploads and operational monitoring/alerting.
