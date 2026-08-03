import { Link } from 'react-router-dom'
import { Heart, Eye, ShoppingBag } from 'lucide-react'
import { Price, Rating, Badge } from '../ui'
import { discountPercent } from '../../lib/format'
import { useCart, useWishlist } from '../../hooks'
import toast from 'react-hot-toast'
import { cn } from '../../lib/cn'

export function ProductCard({ product, variant = 'default', className }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const wished = isInWishlist(product.id)
  const pct = discountPercent(product.originalPrice, product.price)
  const isNew = (product.tags || []).includes('new')

  function onAdd(e) {
    e.preventDefault()
    addToCart(product)
    toast.success(`${product.name} added to cart`)
  }
  function onWish(e) {
    e.preventDefault()
    toggle(product)
    toast.success(wished ? 'Removed from wishlist' : 'Saved to wishlist')
  }

  return (
    <Link to={`/product/${product.slug}`} className={cn('group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card)]', className)}>
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-2)]">
        <img src={product.image} alt={product.name} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {pct > 0 && <Badge tone="sale">-{pct}%</Badge>}
          {isNew && <Badge tone="gold">NEW</Badge>}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          <button onClick={onWish} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg)]/70 text-[var(--color-text-muted)] backdrop-blur hover:text-[var(--color-primary)]">
            <Heart className="h-4 w-4" fill={wished ? 'var(--color-sale)' : 'none'} stroke={wished ? 'var(--color-sale)' : 'currentColor'} />
          </button>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg)]/70 text-[var(--color-text-muted)] backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-4 w-4" />
          </span>
        </div>
        {variant === 'default' && (
          <button onClick={onAdd}
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-[var(--color-content-inv)] py-2.5 text-sm font-medium text-[var(--color-paper)] translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">{product.name}</h3>
        <Rating value={product.rating} size={14} />
        <Price price={product.price} originalPrice={product.originalPrice} size="md" className="mt-1" />
        {variant === 'wishlist' && (
          <button onClick={onAdd} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-border-strong)] py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
            <ShoppingBag className="h-3.5 w-3.5" /> Move to cart
          </button>
        )}
      </div>
    </Link>
  )
}
