import { apiSlice } from '../api/apiSlice'

/**
 * Storefront-facing endpoints: public product catalog + categories, and the
 * authenticated cart/review/create-order flows. Mirrors the backend REST API
 * (mounted at /api). Auth + 401-reauth handled by the base apiSlice.
 */
export const shopApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Public catalog ----
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params: { page: 1, limit: 12, ...params },
      }),
      providesTags: ['Product'],
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Product', slug }],
    }),
    getCategoriesPublic: builder.query({
      query: () => '/categories?limit=100',
      providesTags: ['Category'],
    }),

    // ---- Cart (authenticated, server-side) ----
    getCart: builder.query({ query: () => '/cart', providesTags: ['Cart'] }),
    addCartItem: builder.mutation({
      query: ({ product, quantity = 1, color, size }) => ({
        url: '/cart/items',
        method: 'POST',
        body: { product, quantity, color, size },
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation({
      query: (itemId) => ({ url: `/cart/items/${itemId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCartServer: builder.mutation({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),

    // ---- Checkout ----
    createOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Product', 'Cart'],
    }),

    // ---- Reviews (public read, auth write) ----
    getReviews: builder.query({
      query: (productId) => `/products/${productId}/reviews`,
      providesTags: (result, error, productId) => [{ type: 'Review', productId }],
    }),
    createReview: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetCategoriesPublicQuery,
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartServerMutation,
  useCreateOrderMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
} = shopApiSlice
