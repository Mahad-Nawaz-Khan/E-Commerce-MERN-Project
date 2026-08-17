import { describe, it, expect } from 'vitest'
import { filterProducts, sortProducts, paginate, applyShopQuery } from '../../../src/features/shop/selectors'

const sample = [
  { id: 'a', name: 'Alpha', price: 100, rating: 4.5, stock: 5, category: 'Phones', tags: ['new'], createdAt: '2026-01-02' },
  { id: 'b', name: 'Beta Bear', price: 50, rating: 3.0, stock: 0, category: 'Audio', tags: [], createdAt: '2026-01-01' },
  { id: 'c', name: 'Gamma', price: 200, rating: 5.0, stock: 3, category: 'Phones', tags: ['bestseller'], createdAt: '2026-01-03' },
]

describe('filterProducts', () => {
  it('searches by name (case-insensitive)', () => {
    expect(filterProducts(sample, { search: 'bear' }).map(p => p.id)).toEqual(['b'])
  })
  it('filters by category', () => {
    expect(filterProducts(sample, { category: 'Phones' }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('filters by price range', () => {
    expect(filterProducts(sample, { minPrice: 60, maxPrice: 150 }).map(p => p.id)).toEqual(['a'])
  })
  it('filters by min rating', () => {
    expect(filterProducts(sample, { minRating: 4 }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('excludes out of stock when inStockOnly', () => {
    expect(filterProducts(sample, { inStockOnly: true }).map(p => p.id)).toEqual(['a', 'c'])
  })
  it('combines filters', () => {
    expect(filterProducts(sample, { category: 'Phones', minRating: 4.8 }).map(p => p.id)).toEqual(['c'])
  })
  it('empty filter returns all', () => {
    expect(filterProducts(sample, {}).length).toBe(3)
  })
})

describe('sortProducts', () => {
  it('price-asc', () => { expect(sortProducts(sample, 'price-asc').map(p => p.id)).toEqual(['b', 'a', 'c']) })
  it('price-desc', () => { expect(sortProducts(sample, 'price-desc').map(p => p.id)).toEqual(['c', 'a', 'b']) })
  it('rating', () => { expect(sortProducts(sample, 'rating').map(p => p.id)).toEqual(['c', 'a', 'b']) })
  it('newest', () => { expect(sortProducts(sample, 'newest').map(p => p.id)).toEqual(['c', 'a', 'b']) })
  it('default (no sort) preserves order', () => { expect(sortProducts(sample, '').map(p => p.id)).toEqual(['a', 'b', 'c']) })
})

describe('paginate', () => {
  it('slices by page+perPage', () => {
    expect(paginate(['a', 'b', 'c', 'd', 'e'], 1, 2)).toEqual(['a', 'b'])
    expect(paginate(['a', 'b', 'c', 'd', 'e'], 3, 2)).toEqual(['e'])
  })
  it('clamps page overrange to empty', () => {
    expect(paginate(['a', 'b'], 5, 2)).toEqual([])
  })
})

describe('applyShopQuery', () => {
  it('end-to-end pipeline returns {items, pagination}', () => {
    const r = applyShopQuery(sample, { search: '', category: 'Phones', sort: 'price-desc', page: 1, perPage: 10, minRating: 0, minPrice: 0, maxPrice: Infinity, inStockOnly: false })
    expect(r.items.map(p => p.id)).toEqual(['c', 'a'])
    expect(r.pagination).toEqual({ page: 1, perPage: 10, total: 2, pageCount: 1 })
  })
})
