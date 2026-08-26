import { createSlice } from '@reduxjs/toolkit'

/**
 * Wishlist slice. State: { items: Array<Product> } (no quantity — wishlist is a set).
 * Persisted to localStorage via the store subscriber (Task 18).
 */
const initialState = { items: [] }

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Toggle: add if missing, remove if present.
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
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearWishlist: (state) => {
      state.items = []
    },
    // Hydration action for localStorage preload (Task 18).
    setWishlist: (state, action) => { state.items = action.payload },
  },
})

export const { toggleWishlist, removeFromWishlist, clearWishlist, setWishlist } =
  wishlistSlice.actions

export default wishlistSlice.reducer
