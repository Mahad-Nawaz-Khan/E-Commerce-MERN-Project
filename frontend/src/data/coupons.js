/** Mock coupons. Phase C moves validation to backend. */
export const coupons = [
  { code: 'SAVE10', type: 'percent', value: 10, minSubtotal: 0 },
  { code: 'SAVE50', type: 'fixed', value: 50, minSubtotal: 150 },
  { code: 'FREESHIP', type: 'freeship', value: 0, minSubtotal: 0 },
]

/** Returns { valid, discount, freeShipping, message }. */
export function validateCoupon(code, subtotal) {
  const c = coupons.find((x) => x.code === String(code || '').toUpperCase().trim())
  if (!c) return { valid: false, discount: 0, freeShipping: false, message: 'Invalid coupon code.' }
  if (subtotal < c.minSubtotal) return { valid: false, discount: 0, freeShipping: false, message: `Requires a minimum subtotal of $${c.minSubtotal}.` }
  if (c.type === 'freeship') return { valid: true, discount: 0, freeShipping: true, message: 'Free shipping applied.' }
  const discount = c.type === 'percent' ? Math.round(subtotal * (c.value / 100)) : c.value
  return { valid: true, discount, freeShipping: false, message: `$${discount} discount applied.` }
}
