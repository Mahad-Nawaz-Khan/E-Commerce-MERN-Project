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

/** Compact relative time — "just now", "5m ago", "3h ago", "2d ago", else date. */
export function formatRelativeTime(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`
  return formatDate(iso)
}

/** Integer discount % between original and current price (floored, min 0). */
export function discountPercent(originalPrice, price) {
  if (!originalPrice || originalPrice <= 0) return 0
  if (price >= originalPrice) return 0
  return Math.floor(((originalPrice - price) / originalPrice) * 100)
}
