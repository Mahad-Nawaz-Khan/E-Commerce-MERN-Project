import { useMemo } from 'react'
import {
  products,
  getProductsByTag,
} from '@/data/products'

/**
 * Static product data hook — replaces the Sanity GROQ queries used in the
 * original project (allProductsQuery, todaysDealProductsQuery, bestsellerProductsQuery).
 * Computed once via useMemo since the data is static.
 */
export function useProducts() {
  return useMemo(
    () => ({
      all: products,
      todaysDeals: getProductsByTag('todays-deal'),
      bestsellers: getProductsByTag('bestseller'),
      featured: getProductsByTag('featured'),
    }),
    [],
  )
}
