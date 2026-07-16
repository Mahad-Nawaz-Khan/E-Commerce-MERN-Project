import { Link } from 'react-router-dom'
import { Eye, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { StarRating } from '../components/ui/StarRating'
import { inter, poppins } from '../lib/fonts'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import toast from 'react-hot-toast'

/**
 * Wishlist route — saved wishlist items + a "Just For You" recommended grid.
 * Both lists reuse a local WishlistCard variant (the original had an inline
 * sub-component for this); wishlist cards show a Trash button + discount badge,
 * recommended cards show an Eye + NEW badge + rating.
 */
function WishlistCard({ item, isWishlistItem = false, onRemove, onAddToCart }) {
  const hasDiscount = item.originalPrice > item.price
  const isNew = !isWishlistItem && item.tags?.includes('new')

  return (
    <article className="group flex w-full aspect-27/35 flex-col lg:w-67.5 lg:h-87.5">
      <div className="relative h-[71.428571%] shrink-0 bg-[#F5F5F5] rounded-sm">
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-xs px-3 py-1 rounded-sm">
            -{Math.round((1 - item.price / item.originalPrice) * 100)}%
          </span>
        )}
        {isNew && (
          <span className="absolute top-3 left-3 bg-[#00FF66] text-black text-xs px-3 py-1 rounded-sm">
            NEW
          </span>
        )}

        {isWishlistItem ? (
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center z-10"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <Link
            to={`/product/${item.slug}`}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center z-10"
          >
            <Eye className="w-5 h-5" />
          </Link>
        )}

        <Link to={`/product/${item.slug}`}>
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-contain p-4 cursor-pointer"
            />
          )}
        </Link>

        <div className="absolute inset-x-4 bottom-4">
          <Button
            className="w-full bg-black text-white hover:bg-black/90 h-10 rounded-sm"
            onClick={() => onAddToCart(item)}
          >
            Add To Cart
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-3">
        <h3 className="line-clamp-1 font-medium mb-2">{item.name}</h3>
        <div className="flex gap-3 mb-2">
          <span className="text-[#DB4444] font-medium">${item.price}</span>
          {hasDiscount && (
            <span className="text-[#666666] line-through">${item.originalPrice}</span>
          )}
        </div>

        {!isWishlistItem && (
          <div className="flex items-center gap-2">
            <StarRating rating={item.rating} />
            <span className="text-sm text-[#666666]">({item.reviews})</span>
          </div>
        )}
      </div>
    </article>
  )
}

function WishlistScreen() {
  const wishlist = useWishlist()
  const cart = useCart()
  const { all } = useProducts()
  const recommended = all.slice(0, 4)

  const handleRemoveFromWishlist = (id) => {
    wishlist.remove(id)
    toast.success('Item removed from wishlist')
  }

  const handleAddToCart = (product) => {
    cart.addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  const handleMoveAllToBag = () => {
    wishlist.moveAllToCart()
    toast.success('All items moved to cart!')
  }

  return (
    <div className={`${inter.className} min-h-screen bg-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Wishlist Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className={`${poppins.className} text-2xl font-medium`}>
            Wishlist ({wishlist.count})
          </h1>
          {wishlist.count > 0 && (
            <Button
              variant="outline"
              className="h-12 px-12 rounded-sm border-black hover:bg-black hover:text-white transition-colors"
              onClick={handleMoveAllToBag}
            >
              Move All To Bag
            </Button>
          )}
        </div>

        {/* Wishlist Grid */}
        {wishlist.count > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7.5 lg:justify-items-start mb-20">
            {wishlist.items.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                isWishlistItem
                onRemove={handleRemoveFromWishlist}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-medium mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600">Add items to your wishlist to see them here.</p>
          </div>
        )}

        {/* Just For You Section */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-5 h-10 bg-[#DB4444] rounded-sm" />
              <h2 className={`${poppins.className} text-2xl font-medium`}>Just For You</h2>
            </div>
            <Button
              variant="outline"
              className="h-12 px-12 rounded-sm border-black hover:bg-black hover:text-white transition-colors"
            >
              See All
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7.5 lg:justify-items-start">
            {recommended.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemoveFromWishlist}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { WishlistScreen }
