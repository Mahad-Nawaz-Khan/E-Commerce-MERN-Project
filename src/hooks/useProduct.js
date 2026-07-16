import { getProductBySlug } from '../data/products'

/**
 * Single product lookup by slug — replaces the dynamic [slug] Sanity fetch
 * on the product detail page. Returns the product or undefined (the screen
 * then redirects to the 404 page).
 */
export function useProduct(slug) {
  return getProductBySlug(slug)
}
