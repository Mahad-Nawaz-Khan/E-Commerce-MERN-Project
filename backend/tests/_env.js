process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/exclusive-test'
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32-chars-or-more!!'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-or-more!'
process.env.JWT_EMAIL_SECRET = 'test-email-secret-32-chars-or-more!!'
process.env.NODE_ENV = 'test'
process.env.EMAIL_USER = ''
process.env.EMAIL_PASS = ''
process.env.EMAIL_HOST = ''
// Fake-but-well-formed Stripe keys: webhook signature verification is computed
// locally (no network), so tests can hand-sign payloads with this secret.
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_local_verification'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_testsecret'
