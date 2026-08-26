import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'
import { normalizeProduct } from '../lib/product'
import {
  useGetCartQuery, useAddCartItemMutation, useUpdateCartItemMutation,
  useRemoveCartItemMutation, useClearCartServerMutation,
} from '../features/shop/shopApiSlice'
import { addToCart, removeFromCart, updateQuantity, incrementQuantity, decrementQuantity, clearCart } from '../features/cart'

/** Guest cart — localStorage-backed slice. */
function useLocalCart() {
  const items = useSelector((s) => s.cart.items)
  const dispatch = useDispatch()
  const totalItems = items.reduce((n, i) => n + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return {
    items, totalItems, subtotal, count: items.length, isLoading: false,
    // addToCart(product, quantity, { color, size })
    addToCart: (p, quantity = 1, variant = {}) =>
      dispatch(addToCart({ product: { ...p, ...variant }, quantity })),
    removeFromCart: (id) => dispatch(removeFromCart(id)),
    updateQuantity: (id, q) => dispatch(updateQuantity({ id, quantity: q })),
    increment: (id) => dispatch(incrementQuantity(id)),
    decrement: (id) => dispatch(decrementQuantity(id)),
    clear: () => dispatch(clearCart()),
  }
}

/**
 * Server cart for signed-in users. Maps cart lines
 * { _id, product, quantity, color, size } onto the display item shape and
 * keeps the same API as the guest cart, so consumers never branch.
 */
function useServerCart(enabled) {
  const { data, isLoading } = useGetCartQuery(undefined, { skip: !enabled })
  const [addFn] = useAddCartItemMutation()
  const [updateFn] = useUpdateCartItemMutation()
  const [removeFn] = useRemoveCartItemMutation()
  const [clearFn] = useClearCartServerMutation()

  const items = (data?.data?.items || []).map(({ _id, product, quantity, color, size }) => ({
    ...normalizeProduct(product),
    itemId: _id,
    quantity,
    color,
    size,
  }))
  const totalItems = items.reduce((n, i) => n + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const fail = (err) => toast.error(err?.data?.error?.message || 'Cart update failed')
  const resolve = (ref) => (typeof ref === 'object' ? ref : items.find((i) => i.id === ref))

  return {
    items, totalItems, subtotal, count: items.length, isLoading,
    addToCart: (p, quantity = 1, variant = {}) =>
      addFn({ productId: p.id ?? p._id, quantity, color: variant.color, size: variant.size }).unwrap().catch(fail),
    removeFromCart: (ref) => {
      const item = resolve(ref)
      return removeFn(item?.itemId ?? ref).unwrap().catch(fail)
    },
    updateQuantity: (ref, q) => {
      const item = resolve(ref)
      if (item) updateFn({ itemId: item.itemId, quantity: q }).unwrap().catch(fail)
    },
    increment: (ref) => {
      const item = resolve(ref)
      if (item) updateFn({ itemId: item.itemId, quantity: item.quantity + 1 }).unwrap().catch(fail)
    },
    decrement: (ref) => {
      const item = resolve(ref)
      if (item) updateFn({ itemId: item.itemId, quantity: Math.max(1, item.quantity - 1) }).unwrap().catch(fail)
    },
    clear: () => clearFn().unwrap().catch(fail),
  }
}

/**
 * Cart selector hook — server-backed while signed in, localStorage for guests.
 * Guest items are merged into the server cart on login (see app/AuthSync).
 */
export function useCart() {
  const { isAuthenticated } = useAuth()
  const local = useLocalCart()
  const server = useServerCart(isAuthenticated)
  return isAuthenticated ? server : local
}
