import { useDispatch, useSelector } from 'react-redux'
import {
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../features/wishlist'
import { addToCart } from '../features/cart'

/**
 * Wishlist selector hook — exposes wishlist state plus bound action dispatchers.
 * `moveAllToCart` mirrors the wishlist page's "Move All To Bag" feature.
 */
export function useWishlist() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.wishlist.items)

  return {
    items,
    count: items.length,
    isInWishlist: (id) => items.some((item) => item.id === id),
    toggle: (product) => dispatch(toggleWishlist(product)),
    remove: (id) => dispatch(removeFromWishlist(id)),
    clear: () => dispatch(clearWishlist()),
    moveAllToCart: () => {
      items.forEach((product) => dispatch(addToCart(product)))
      dispatch(clearWishlist())
    },
  }
}
