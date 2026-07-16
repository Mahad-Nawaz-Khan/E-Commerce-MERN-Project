import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '../ui/Button'
import { useCart } from '../../hooks/useCart'
import toast from 'react-hot-toast'

/**
 * Full-width "Add to Cart" CTA used on the product detail page.
 * Mirrors the original's isAdding loading state + toast feedback,
 * but dispatches to the Redux cart store instead of localStorage.
 */
function AddToCartButton({ product }) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    // tiny delay to surface the "Adding..." state, matching the original
    await new Promise((resolve) => setTimeout(resolve, 200))
    addToCart(product)
    setIsAdding(false)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="w-full bg-black text-white hover:bg-black/90 text-xl py-6 flex items-center justify-center gap-3"
    >
      <ShoppingCart className="w-6 h-6" />
      {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
    </Button>
  )
}

export { AddToCartButton }
