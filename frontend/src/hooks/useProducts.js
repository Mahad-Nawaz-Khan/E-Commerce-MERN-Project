import { useGetHomepageDataQuery } from '../features/shop/shopApiSlice'
import { normalizeProduct } from '../lib/product'

const mapList = (arr) => (arr || []).map(normalizeProduct)

/**
 * Live catalog hook for storefront sections (Flash Sales, Best Sellers,
 * Explore, New Arrivals, Featured Drop, Categories). Powered by a single
 * bulk homepage query with edge + client cache.
 */
export function useProducts() {
  const { data, isLoading, isFetching, isSuccess } = useGetHomepageDataQuery()
  const payload = data?.data

  return {
    all: mapList(payload?.explore),
    todaysDeals: mapList(payload?.todaysDeals),
    bestsellers: mapList(payload?.bestsellers),
    newArrivals: mapList(payload?.newArrivals),
    featured: mapList(payload?.featured),
    categories: payload?.categories || [],
    isLoading,
    isFetching,
    isSuccess,
  }
}
