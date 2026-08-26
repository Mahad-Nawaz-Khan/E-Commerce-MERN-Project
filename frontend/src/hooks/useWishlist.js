import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'
import { normalizeProduct } from '../lib/product'
import {
  useGetWishlistQuery, useToggleWishlistMutation,
  useRemoveWishlistItemMutation, useClearWishlistServerMutation,
} from '../features/shop/shopApiSlice'
import { toggleWishlist, removeFromWishlist, clearWishlist } from '../features/wishlist'

/** Guest wishlist — localStorage-backed slice. */
function useLocalWishlist() {
  const items = useSelector((s) => s.wishlist.items)
  const dispatch = useDispatch()
  return {
    items, count: items.length, isLoading: false,
    isInWishlist: (id) => items.some((i) => i.id === id),
    toggle: (p) => dispatch(toggleWishlist(p)),
    remove: (id) => dispatch(removeFromWishlist(id)),
    clear: () => dispatch(clearWishlist()),
    moveAllToCart: (addToCartFn) => items.forEach((p) => addToCartFn(p)),
  }
}

/** Server wishlist for signed-in users — same API as the guest version. */
function useServerWishlist(enabled) {
  const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !enabled })
  const [toggleFn] = useToggleWishlistMutation()
  const [removeFn] = useRemoveWishlistItemMutation()
  const [clearFn] = useClearWishlistServerMutation()

  const items = (data?.data?.products || []).map(normalizeProduct)
  const fail = (err) => toast.error(err?.data?.error?.message || 'Wishlist update failed')

  return {
    items, count: items.length, isLoading,
    isInWishlist: (id) => items.some((i) => i.id === id),
    toggle: (p) => toggleFn(p.id ?? p._id).unwrap().catch(fail),
    remove: (id) => removeFn(id).unwrap().catch(fail),
    clear: () => clearFn().unwrap().catch(fail),
    moveAllToCart: (addToCartFn) => items.forEach((p) => addToCartFn(p)),
  }
}

/**
 * Wishlist selector hook — server-backed while signed in, localStorage for
 * guests. Guest saves are merged into the server wishlist on login
 * (see app/AuthSync). `moveAllToCart` accepts an addToCart function so the
 * wishlist page can move every item into the cart without importing the cart slice.
 */
export function useWishlist() {
  const { isAuthenticated } = useAuth()
  const local = useLocalWishlist()
  const server = useServerWishlist(isAuthenticated)
  return isAuthenticated ? server : local
}
