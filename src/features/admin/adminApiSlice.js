import { apiSlice } from '../api/apiSlice'

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Customer analytics
    getCustomerStats: builder.query({
      query: ({ page = 1, limit = 25, search = '', sort = 'totalSpent' } = {}) => ({
        url: '/admin/customers/stats',
        params: { page, limit, search, sort },
      }),
      providesTags: ['Customer'],
    }),
    getCustomerHistory: builder.query({
      query: (id) => `/admin/customers/${id}/history`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    getCustomerCount: builder.query({
      query: () => '/admin/customers/count',
      providesTags: ['Customer'],
    }),

    // Sales analytics
    getSalesOverview: builder.query({
      query: () => '/admin/analytics/overview',
      providesTags: ['Analytics'],
    }),
    getSalesTrends: builder.query({
      query: (period = '30d') => ({
        url: '/admin/analytics/sales-trends',
        params: { period },
      }),
      providesTags: ['Analytics'],
    }),

    // Inventory analytics
    getInventoryStats: builder.query({
      query: ({ page = 1, limit = 25, stockFilter = 'all' } = {}) => ({
        url: '/admin/analytics/inventory',
        params: { page, limit, stockFilter },
      }),
      providesTags: ['Product', 'Analytics'],
    }),

    // Category analytics
    getCategoryAnalytics: builder.query({
      query: () => '/admin/analytics/categories',
      providesTags: ['Category', 'Analytics'],
    }),

    // Admin product list (ALL products incl. inactive, paginated/filterable)
    getAdminProducts: builder.query({
      query: ({ page = 1, limit = 20, search = '', category, stockFilter, isActive } = {}) => ({
        url: '/admin/products',
        params: { page, limit, search, category, stockFilter, isActive },
      }),
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),

    // Category CRUD (uses the public /categories endpoints, admin-guarded server-side)
    getCategories: builder.query({
      query: () => '/categories?limit=100',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),

    // Admin order list (paginated, filterable)
    getAdminOrders: builder.query({
      query: ({ page = 1, limit = 25, status = 'all', paymentStatus = 'all', search = '' } = {}) => ({
        url: '/admin/orders',
        params: { page, limit, status, paymentStatus, search },
      }),
      providesTags: ['Order'],
    }),
    getAdminOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    // Reviews moderation
    getAdminReviews: builder.query({
      query: ({ page = 1, limit = 25, rating, product } = {}) => ({
        url: '/admin/reviews',
        params: { page, limit, rating, product },
      }),
      providesTags: ['Review'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Review', 'Product'],
    }),

    // Bulk product operations
    bulkUpdateProducts: builder.mutation({
      query: ({ ids, updates }) => ({
        url: '/admin/products/bulk-update',
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: ['Product'],
    }),
    bulkDeleteProducts: builder.mutation({
      query: ({ ids, hard = false }) => ({
        url: '/admin/products/bulk-delete',
        method: 'DELETE',
        body: { ids, hard },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const {
  useGetCustomerStatsQuery,
  useGetCustomerHistoryQuery,
  useGetCustomerCountQuery,
  useGetSalesOverviewQuery,
  useGetSalesTrendsQuery,
  useGetInventoryStatsQuery,
  useGetCategoryAnalyticsQuery,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderStatusMutation,
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
} = adminApiSlice
