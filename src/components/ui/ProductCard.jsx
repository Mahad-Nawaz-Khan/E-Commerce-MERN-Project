import { Link } from 'react-router-dom'
import { Heart, Eye } from 'lucide-react'
import { Button } from './Button'
import { StarRating } from './StarRating'
import { useCart } from '../../hooks/useCart'
import { useWishlist } from '../../hooks/useWishlist'
import toast from 'react-hot-toast'

/**
 * Reusable product card 
 *
 * Features:
 *   - "NEW" badge when tags includes "new"
 *   - wishlist heart toggle (reads/writes Redux) + "Eye" quick-view link
 *   - product image links to /product/:slug
 *   - hover "Add To Cart" bar (dispatches to Redux + toast)
 *   - price + struck-through original + 5-star rating + review count
 *
 * Props:
 *   product:      product object
 *   showNewBadge: show the green NEW badge (default true)
 *   showRating:   show the stars + review count (default true)
 */
function ProductCard({
  product,
  showNewBadge = true,
  showRating = true,
  className = '',
}) {
  const cart = useCart()
  const wishlist = useWishlist()
  const inWishlist = wishlist.isInWishlist(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    cart.addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    wishlist.toggle(product)
    toast.success(
      inWishlist
        ? `${product.name} removed from wishlist!`
        : `${product.name} added to wishlist!`,
    )
  }

  const isNew = showNewBadge && product.tags?.includes('new')
  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  return (
    <article
      className={`group flex w-full aspect-27/35 flex-col bg-white rounded-sm lg:w-67.5 lg:h-87.5 ${className}`}
    >
      <Link to={`/product/${product.slug}`} className="block h-[71.428571%] shrink-0">
        <div className="relative h-full bg-[#F5F5F5] rounded-sm p-3 sm:p-4">
          {(isNew || discount > 0) && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
              <span className={`${isNew ? 'bg-[#00FF66] text-black' : 'bg-[#DB4444] text-white'} text-2.5 sm:text-xs px-2 sm:px-3 py-1 rounded-sm`}>
                {isNew ? 'NEW' : `-${discount}%`}
              </span>
            </div>
          )}

          {/* Wishlist + quick-view actions */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white ${inWishlist ? 'text-red-500' : ''}`}
              onClick={handleToggleWishlist}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white"
            >
              <Link to={`/product/${product.slug}`}>
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>

          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          )}

          {/* Hover add-to-cart bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button
              className="w-full bg-black text-white hover:bg-black/90 h-9 sm:h-10 rounded-none text-sm font-medium px-3 sm:px-4"
              onClick={handleAddToCart}
            >
              Add To Cart
            </Button>
          </div>
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col pt-3">
        <h3 className="line-clamp-1 font-medium text-sm sm:text-base mb-1 sm:mb-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <span className="text-[#DB4444] font-medium text-sm sm:text-base">
            ${product.price}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[#666666] line-through text-xs sm:text-sm">
              ${product.originalPrice}
            </span>
          )}
        </div>
        {showRating && (
          <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
            <StarRating rating={product.rating} />
            <span className="text-xs sm:text-sm text-[#666666]">
              ({product.reviews})
            </span>
          </div>
        )}
      </div>
    </article>
  )
}

export { ProductCard }
