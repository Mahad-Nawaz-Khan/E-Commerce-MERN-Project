import { useSelector, useDispatch } from 'react-redux'
import { toggleWishlist, removeFromWishlist, clearWishlist } from '../features/wishlist'

/**
 * Wishlist selector hook — exposes wishlist state plus bound action dispatchers.
 * `moveAllToCart` accepts an addToCart function so the wishlist page can move
 * every item into the cart without this hook importing the cart slice.
 */
export function useWishlist() {
  const items = useSelector((s) => s.wishlist.items)
  const dispatch = useDispatch()
  return {
    items, count: items.length,
    isInWishlist: (id) => items.some((i) => i.id === id),
    toggle: (p) => dispatch(toggleWishlist(p)),
    remove: (id) => dispatch(removeFromWishlist(id)),
    clear: () => dispatch(clearWishlist()),
    moveAllToCart: (addToCartFn) => items.forEach((p) => addToCartFn(p)),
  }
}
