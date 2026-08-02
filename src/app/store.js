import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../store/slices/cartSlice'
import wishlistReducer from '../store/slices/wishlistSlice'

// NOTE: M3 swaps these for feature-folder slices + ui/auth + localStorage persistence.
export const store = configureStore({
  reducer: { cart: cartReducer, wishlist: wishlistReducer },
})
