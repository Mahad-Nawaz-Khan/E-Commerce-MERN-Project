import { createSlice } from '@reduxjs/toolkit'

/**
 * Shopping cart slice. State: { items: Array<Product & { quantity }> }.
 * Persisted to localStorage via the store subscriber (Task 18).
 */
const initialState = { items: [] }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Accepts a product, or { product, quantity }. Defaults quantity 1.
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload?.product
        ? action.payload
        : { product: action.payload, quantity: 1 }
      const existing = state.items.find((item) => item.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ ...product, quantity })
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find((item) => item.id === id)
      if (item) item.quantity = Math.max(1, quantity)
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item) item.quantity += 1
    },
    decrementQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity > 1) item.quantity -= 1
    },
    clearCart: (state) => { state.items = [] },
    // Hydration action for localStorage preload (Task 18).
    setCart: (state, action) => { state.items = action.payload },
  },
})

export const {
  addToCart, removeFromCart, updateQuantity, incrementQuantity,
  decrementQuantity, clearCart, setCart,
} = cartSlice.actions

export default cartSlice.reducer
