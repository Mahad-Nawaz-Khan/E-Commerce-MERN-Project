import { describe, it, expect } from 'vitest'
import { formatPrice, formatNumber, formatDate, discountPercent } from '../../src/lib/format'

describe('formatPrice', () => {
  it('whole dollars', () => { expect(formatPrice(650)).toBe('$650') })
  it('fractional 2 decimals', () => { expect(formatPrice(19.5)).toBe('$19.50') })
  it('zero', () => { expect(formatPrice(0)).toBe('$0') })
})
describe('formatNumber', () => {
  it('thousands', () => { expect(formatNumber(10500)).toBe('10,500') })
  it('small', () => { expect(formatNumber(42)).toBe('42') })
})
describe('formatDate', () => {
  it('iso readable', () => {
    expect(formatDate('2026-08-02T12:00:00Z')).toMatch(/Aug/)
    expect(formatDate('2026-08-02T12:00:00Z')).toMatch(/2026/)
  })
})
describe('discountPercent', () => {
  it('floored', () => { expect(discountPercent(900, 650)).toBe(27) })
  it('no discount', () => { expect(discountPercent(100, 100)).toBe(0) })
  it('missing original', () => {
    expect(discountPercent(undefined, 100)).toBe(0)
    expect(discountPercent(0, 100)).toBe(0)
  })
})
