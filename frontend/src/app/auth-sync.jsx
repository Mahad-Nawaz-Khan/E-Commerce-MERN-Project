import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { shopApiSlice } from '../features/shop/shopApiSlice'
import { clearCart } from '../features/cart'
import { clearWishlist } from '../features/wishlist'

/**
 * Bridges guest state to the server on sign-in: pushes localStorage cart and
 * wishlist items into the authenticated endpoints, then clears the local
 * copies. Runs once per login transition (including session rehydration at
 * app start), and is a no-op when nothing was saved as a guest.
 */
export function AuthSync() {
  const { isAuthenticated } = useAuth()
  const dispatch = useDispatch()
  const guestCart = useSelector((s) => s.cart.items)
  const guestWishlist = useSelector((s) => s.wishlist.items)
  const mergedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || mergedRef.current) return
    mergedRef.current = true
    if (guestCart.length === 0 && guestWishlist.length === 0) return

    ;(async () => {
      try {
        let merged = 0

        if (guestWishlist.length > 0) {
          // Toggle-only-missing: toggling an id the server already has would remove it.
          const current = await dispatch(shopApiSlice.endpoints.getWishlist.initiate()).unwrap()
          const serverIds = new Set((current?.data?.products || []).map((p) => String(p._id)))
          for (const item of guestWishlist) {
            if (!serverIds.has(String(item.id))) {
              await dispatch(shopApiSlice.endpoints.toggleWishlist.initiate(item.id)).unwrap()
              merged += 1
            }
          }
          dispatch(clearWishlist())
        }

        if (guestCart.length > 0) {
          for (const item of guestCart) {
            await dispatch(shopApiSlice.endpoints.addCartItem.initiate({
              productId: item.id,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
            })).unwrap()
            merged += 1
          }
          dispatch(clearCart())
        }

        if (merged > 0) toast.success(`Synced ${merged} saved item${merged !== 1 ? 's' : ''} to your account`)
      } catch {
        mergedRef.current = false // allow a retry on the next transition
      }
    })()
  }, [isAuthenticated, guestCart, guestWishlist, dispatch])

  return null
}
