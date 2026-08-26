import { useGetProductsQuery } from '../features/shop/shopApiSlice'
import { normalizeProduct } from '../lib/product'

const pick = (result) => (result.data?.data || []).map(normalizeProduct)

/**
 * Live catalog hook for product-card grids (Flash Sales, Best Sellers,
 * Explore, Wishlist "Just For You"). Each section query is cached and deduped
 * by RTK Query, so multiple components asking for the same slice share one
 * request. Returns display-normalized products (id/image/rating/reviews).
 */
export function useProducts() {
  const deals = useGetProductsQuery({ tags: 'todays-deal', limit: 8 })
  const best = useGetProductsQuery({ tags: 'bestseller', limit: 8 })
  const fresh = useGetProductsQuery({ tags: 'new', limit: 8 })
  const featured = useGetProductsQuery({ tags: 'featured', limit: 8 })
  const all = useGetProductsQuery({ limit: 24 })

  return {
    all: pick(all),
    todaysDeals: pick(deals),
    bestsellers: pick(best),
    newArrivals: pick(fresh),
    featured: pick(featured),
    isLoading: all.isFetching || deals.isFetching || best.isFetching,
  }
}
