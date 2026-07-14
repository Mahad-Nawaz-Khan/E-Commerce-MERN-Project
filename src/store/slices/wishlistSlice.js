import { createSlice } from '@reduxjs/toolkit'

/**
 * In-memory wishlist slice.
 * State shape: { items: Array<Product> }  (no quantity — wishlist is a set)
 */
const initialState = {
  items: [],
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Toggle: add if missing, remove if present. Returns nothing — components
    // can read the resulting list directly for toast messaging.
    toggleWishlist: (state, action) => {
      const product = action.payload
      const existing = state.items.find((item) => item.id === product.id)
      if (existing) {
        state.items = state.items.filter((item) => item.id !== product.id)
      } else {
        state.items.push(product)
      }
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((item) => item.id !== id)
    },
    clearWishlist: (state) => {
      state.items = []
    },
  },
})

export const { toggleWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions

export default wishlistSlice.reducer
