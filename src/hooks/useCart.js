import { useDispatch, useSelector } from 'react-redux'
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from '@/store/slices/cartSlice'

/**
 * Cart selector hook — exposes cart state plus bound action dispatchers.
 * Replaces the original project's raw localStorage actions.ts functions.
 */
export function useCart() {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items)

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  return {
    items,
    totalItems,
    subtotal,
    addToCart: (product) => dispatch(addToCart(product)),
    removeFromCart: (id) => dispatch(removeFromCart(id)),
    updateQuantity: (id, quantity) =>
      dispatch(updateQuantity({ id, quantity })),
    increment: (id) => dispatch(incrementQuantity(id)),
    decrement: (id) => dispatch(decrementQuantity(id)),
    clear: () => dispatch(clearCart()),
  }
}
