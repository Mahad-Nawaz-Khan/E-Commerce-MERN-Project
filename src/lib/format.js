/** USD; whole dollars omit decimals, fractional show 2 decimals. */
export function formatPrice(value) {
  if (value == null || Number.isNaN(value)) return '$0'
  const n = Number(value)
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

/** Thousands-separated integer. */
export function formatNumber(value) {
  if (value == null) return '0'
  return Number(value).toLocaleString('en-US')
}

/** Human-readable date from an ISO string. */
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Integer discount % between original and current price (floored, min 0). */
export function discountPercent(originalPrice, price) {
  if (!originalPrice || originalPrice <= 0) return 0
  if (price >= originalPrice) return 0
  return Math.floor(((originalPrice - price) / originalPrice) * 100)
}
