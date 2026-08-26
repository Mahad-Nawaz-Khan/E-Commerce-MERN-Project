import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, tokenRefreshed, logout } from '../auth/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  // Send the HttpOnly refresh cookie on /auth/refresh.
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

let refreshing = false
let pendingRefreshers = []

/**
 * baseQuery with automatic 401 → /auth/refresh → retry handling.
 * Coalesces concurrent refresh attempts so N parallel 401s trigger one refresh.
 * The backend refresh cookie is HttpOnly so we never read it from JS — we just
 * rely on `credentials: 'include'` to send it, then store the returned access token.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Only attempt a refresh if there's a plausible logged-in session. Otherwise
    // an unauthenticated user hitting a public-ish 401 would be force-logged-out.
    const hadToken = api.getState().auth.token

    if (!refreshing) {
      if (!hadToken) return result
      refreshing = true
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      )
      refreshing = false

      if (refreshResult.data?.data?.accessToken) {
        api.dispatch(tokenRefreshed({ token: refreshResult.data.data.accessToken }))
        // Resolve any concurrent waiters, then retry the original request.
        pendingRefreshers.forEach((resolve) => resolve(true))
        pendingRefreshers = []
        result = await baseQuery(args, api, extraOptions)
      } else {
        pendingRefreshers.forEach((resolve) => resolve(false))
        pendingRefreshers = []
        api.dispatch(logout())
      }
    } else {
      // Another request is already refreshing — wait for its outcome.
      const ok = await new Promise((resolve) => pendingRefreshers.push(resolve))
      if (ok) {
        result = await baseQuery(args, api, extraOptions)
      }
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Order', 'Address', 'Product', 'Category', 'Customer', 'Analytics', 'Cart', 'Wishlist', 'Review', 'Media', 'Notification'],
  endpoints: () => ({}),
})

export { setCredentials }
