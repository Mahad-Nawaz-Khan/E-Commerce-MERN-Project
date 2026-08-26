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
    // NoSQL injection guard: never let $-prefixed or dotted keys reach the filter.
    if (key.startsWith('$') || key.includes('.')) continue
    if (typeof value === 'object' && value !== null) {
      const ops = {}
      for (const [op, v] of Object.entries(value)) {
        if (op.startsWith('$') || op.includes('.')) continue
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
  const [docs, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit).select(select).lean({ getters: true, virtuals: true }),
    Model.countDocuments(filter),
  ])
  // Lean docs skip the `id` virtual — add it back so list consumers can use
  // either `id` or `_id` consistently.
  const data = docs.map((doc) => ({ ...doc, id: String(doc._id) }))
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  }
}

export { ApiError }
