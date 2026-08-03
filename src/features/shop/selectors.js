/** Pure shop pipeline functions. No React/Redux — fully testable. */

export function filterProducts(list, q) {
  const { search = '', category = '', minPrice = 0, maxPrice = Infinity, minRating = 0, inStockOnly = false, tag = '' } = q
  const term = String(search).trim().toLowerCase()
  return list.filter((p) => {
    if (term && !(p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term))) return false
    if (category && p.category !== category) return false
    if (p.price < minPrice || p.price > maxPrice) return false
    if (p.rating < minRating) return false
    if (inStockOnly && p.stock <= 0) return false
    if (tag && !(p.tags || []).includes(tag)) return false
    return true
  })
}

export function sortProducts(list, sort) {
  const copy = [...list]
  switch (sort) {
    case 'price-asc': return copy.sort((a, b) => a.price - b.price)
    case 'price-desc': return copy.sort((a, b) => b.price - a.price)
    case 'rating': return copy.sort((a, b) => b.rating - a.rating)
    case 'newest': return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default: return copy
  }
}

export function paginate(list, page, perPage) {
  const start = (page - 1) * perPage
  return list.slice(start, start + perPage)
}

export function pageCount(total, perPage) {
  return Math.max(1, Math.ceil(total / perPage))
}

/** Full pipeline: filter -> sort -> paginate. Returns { items, pagination }. */
export function applyShopQuery(list, q) {
  const { sort = '', page = 1, perPage = 12 } = q
  const filtered = filterProducts(list, q)
  const sorted = sortProducts(filtered, sort)
  const clampedPage = Math.min(Math.max(1, page), pageCount(filtered.length, perPage))
  const items = paginate(sorted, clampedPage, perPage)
  return { items, pagination: { page: clampedPage, perPage, total: filtered.length, pageCount: pageCount(filtered.length, perPage) } }
}
