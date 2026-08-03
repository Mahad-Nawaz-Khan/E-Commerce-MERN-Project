import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Breadcrumb, Button, Price, Rating, Badge, QuantityStepper, Tabs } from '../components/ui'
import { ProductGallery } from '../components/product/product-gallery'
import { ProductOptions } from '../components/product/product-options'
import { RelatedProducts } from '../components/product/related-products'
import { useProduct, useProducts, useCart, useWishlist } from '../hooks'
import { getReviews } from '../data/reviews'
import { NotFoundScreen } from './NotFoundScreen'
import toast from 'react-hot-toast'
import { Heart, Truck, ShieldCheck, RefreshCw } from 'lucide-react'

/**
 * Product detail route. Gallery + info (title, rating, price, stock, options,
 * qty, add/buy-now/wishlist, delivery info), then Description/Reviews tabs and
 * related products. Renders the 404 screen when the slug resolves to nothing.
 */
function ProductDetailScreen() {
  const { slug } = useParams()
  const product = useProduct(slug)
  const { all } = useProducts()
  const { addToCart } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const navigate = useNavigate()
  const [color, setColor] = useState(product?.colors?.[0])
  const [size, setSize] = useState(product?.sizes?.[0])
  const [qty, setQty] = useState(1)

  if (!product) return <NotFoundScreen />
  const wished = isInWishlist(product.id)

  function add() { addToCart(product, qty); toast.success(`${product.name} added to cart`) }
  function buyNow() { add(); navigate('/checkout') }
  function wish() { toggle(product); toast.success(wished ? 'Removed from wishlist' : 'Saved to wishlist') }

  const reviews = getReviews(product.slug)
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: product.name }]} className="mb-6" />
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Rating value={product.rating} />
              <span className="text-sm text-[var(--color-text-muted)]">({product.reviews} reviews)</span>
            </div>
          </div>
          <Price price={product.price} originalPrice={product.originalPrice} size="xl" />
          <div className="flex items-center gap-2">
            {product.stock > 0 ? <Badge tone="success">In stock</Badge> : <Badge tone="sale">Out of stock</Badge>}
            <span className="text-sm text-[var(--color-text-subtle)] nums">{product.stock} available</span>
          </div>
          <ProductOptions colors={product.colors} sizes={product.sizes} selectedColor={color} selectedSize={size} onSelectColor={setColor} onSelectSize={setSize} />
          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper value={qty} min={1} max={product.stock || 99} onChange={setQty} />
            <Button onClick={add} disabled={product.stock === 0}>Add to cart</Button>
            <Button variant="sale" onClick={buyNow} disabled={product.stock === 0}>Buy now</Button>
            <Button variant="ghost" size="icon" aria-label="Wishlist" onClick={wish}><Heart className="h-5 w-5" fill={wished ? 'var(--color-sale)' : 'none'} stroke={wished ? 'var(--color-sale)' : 'currentColor'} /></Button>
          </div>
          <ul className="mt-2 grid gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)] sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[var(--color-primary)]" /> Free delivery</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" /> 2-year warranty</li>
            <li className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-[var(--color-primary)]" /> 30-day returns</li>
          </ul>
        </div>
      </div>
      <div className="mt-12">
        <Tabs tabs={[
          { label: 'Description', content: <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">{product.description}</p> },
          { label: `Reviews (${reviews.length})`, content: reviews.length ? (
            <ul className="max-w-2xl space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-between"><span className="font-medium text-[var(--color-text)]">{r.author}</span><Rating value={r.rating} size={14} /></div>
                  <p className="mt-1 text-xs text-[var(--color-text-subtle)]">{r.date}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{r.body}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-[var(--color-text-muted)]">No reviews yet.</p> },
        ]} />
      </div>
      <RelatedProducts products={all} currentId={product.id} />
    </Container>
  )
}

export { ProductDetailScreen }
