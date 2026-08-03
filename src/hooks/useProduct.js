import { getProductBySlug } from '../data/products'

/**
 * Single product lookup by slug, used on the product detail page.
 * Returns the full product record (or undefined — the screen then redirects
 * to the 404 page).
 */
export function useProduct(slug) {
  return getProductBySlug(slug)
}
