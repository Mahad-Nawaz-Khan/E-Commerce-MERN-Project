import { configureStore } from '@reduxjs/toolkit'
import { cartReducer } from '../features/cart'
import { wishlistReducer } from '../features/wishlist'
import { uiReducer } from '../features/ui'
import { authReducer } from '../features/auth'
import { apiSlice } from '../features/api/apiSlice'
import { STORAGE_KEYS } from '../lib/constants'

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

const preloadedCart = load(STORAGE_KEYS.CART)
const preloadedWishlist = load(STORAGE_KEYS.WISHLIST)
const preloadedAuth = load(STORAGE_KEYS.AUTH)

export const store = configureStore({
  reducer: { 
    cart: cartReducer, 
    wishlist: wishlistReducer, 
    ui: uiReducer, 
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  preloadedState: {
    ...(preloadedCart ? { cart: preloadedCart } : {}),
    ...(preloadedWishlist ? { wishlist: preloadedWishlist } : {}),
    ...(preloadedAuth ? { auth: preloadedAuth } : {}),
  },
})

let saveTimer
function persist() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(store.getState().cart))
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(store.getState().wishlist))
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(store.getState().auth))
    } catch {
      /* quota/private mode — ignore */
    }
  }, 300)
}
store.subscribe(persist)
