import { describe, it, expect } from 'vitest'
import { validateCoupon } from '../../src/data/coupons'

describe('validateCoupon', () => {
  it('accepts a valid fixed coupon above threshold', () => {
    const r = validateCoupon('SAVE50', 200)
    expect(r.valid).toBe(true)
    expect(r.discount).toBe(50)
  })
  it('accepts a valid percent coupon', () => {
    const r = validateCoupon('SAVE10', 200)
    expect(r.valid).toBe(true)
    expect(r.discount).toBe(20)
  })
  it('rejects below minimum subtotal', () => {
    const r = validateCoupon('SAVE50', 100)
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/minimum/i)
  })
  it('rejects unknown code', () => {
    const r = validateCoupon('NOPE', 500)
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/invalid/i)
  })
  it('handles freeship', () => {
    const r = validateCoupon('FREESHIP', 100)
    expect(r.valid).toBe(true)
    expect(r.freeShipping).toBe(true)
  })
})
