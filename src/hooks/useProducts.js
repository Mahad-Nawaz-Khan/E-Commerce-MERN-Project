import { useMemo } from 'react'
import {
  getProductSummaries,
  getProductSummariesByTag,
} from '../data/products'

/**
 * Static product summary hook for product-card grids (Flash Sales, Best
 * Sellers, Explore, Wishlist "Just For You", Shop). Returns only the fields a
 * card needs (id, name, slug, image, price, originalPrice, rating, reviews,
 * category, tags) so grids don't carry full detail-page payloads.
 *
 * Product detail screens should use `useProduct` instead.
 */
export function useProducts() {
  return useMemo(
    () => ({
      all: getProductSummaries(),
      todaysDeals: getProductSummariesByTag('todays-deal'),
      bestsellers: getProductSummariesByTag('bestseller'),
      featured: getProductSummariesByTag('featured'),
    }),
    [],
  )
}
