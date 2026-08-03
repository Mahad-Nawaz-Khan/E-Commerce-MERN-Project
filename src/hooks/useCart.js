import { useSelector, useDispatch } from 'react-redux'
import { addToCart, removeFromCart, updateQuantity, incrementQuantity, decrementQuantity, clearCart } from '../features/cart'

/**
 * Cart selector hook — exposes cart state plus bound action dispatchers.
 * addToCart accepts a bare product (defaults to qty 1) or (product, quantity).
 */
export function useCart() {
  const items = useSelector((s) => s.cart.items)
  const dispatch = useDispatch()
  const totalItems = items.reduce((n, i) => n + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return {
    items, totalItems, subtotal, count: items.length,
    // addToCart(product) or addToCart(product, quantity)
    addToCart: (p, quantity = 1) => dispatch(addToCart(quantity > 1 ? { product: p, quantity } : p)),
    removeFromCart: (id) => dispatch(removeFromCart(id)),
    updateQuantity: (id, q) => dispatch(updateQuantity({ id, quantity: q })),
    increment: (id) => dispatch(incrementQuantity(id)),
    decrement: (id) => dispatch(decrementQuantity(id)),
    clear: () => dispatch(clearCart()),
  }
}
