import { apiSlice } from '../api/apiSlice'

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User profile
    getUser: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Addresses
    getAddresses: builder.query({
      query: () => '/users/me/addresses',
      providesTags: ['Address'],
    }),
    addAddress: builder.mutation({
      query: (data) => ({
        url: '/users/me/addresses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Address'],
    }),
    updateAddress: builder.mutation({
      query: ({ addressId, ...data }) => ({
        url: `/users/me/addresses/${addressId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Address'],
    }),
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/me/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),
    setDefaultAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/me/addresses/${addressId}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Address'],
    }),
    
    // Password
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/users/me/change-password',
        method: 'PATCH',
        body: data,
      }),
    }),
    
    // User stats
    getUserStats: builder.query({
      query: () => '/users/me/stats',
      providesTags: ['User'],
    }),
    
    // Orders
    getOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    getOrderTracking: builder.query({
      query: (id) => `/orders/${id}/tracking`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useChangePasswordMutation,
  useGetUserStatsQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrderTrackingQuery,
  useCancelOrderMutation,
} = userApiSlice
