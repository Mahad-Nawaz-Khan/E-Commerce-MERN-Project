import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Breadcrumb, Button, Price, Rating, Badge, QuantityStepper, Tabs, Skeleton, Textarea, Input } from '../components/ui'
import { ProductGallery } from '../components/product/product-gallery'
import { ProductOptions } from '../components/product/product-options'
import { RelatedProducts } from '../components/product/related-products'
import { useCart, useWishlist, useAuth } from '../hooks'
import { useGetProductBySlugQuery, useGetProductsQuery, useGetReviewsQuery, useCreateReviewMutation } from '../features/shop/shopApiSlice'
import { normalizeProduct } from '../lib/product'
import { NotFoundScreen } from './NotFoundScreen'
import toast from 'react-hot-toast'
import { Heart, Truck, ShieldCheck, RefreshCw } from 'lucide-react'

/** Review form shown to signed-in users; posts to /products/:id/reviews. */
function ReviewForm({ productId }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [createReview, { isLoading }] = useCreateReviewMutation()

  async function submit(e) {
    e.preventDefault()
    if (!rating) { toast.error('Pick a star rating first'); return }
    try {
      await createReview({ productId, rating, title: title.trim() || undefined, body: body.trim() || undefined }).unwrap()
      setRating(0); setTitle(''); setBody('')
      toast.success('Thanks for the review!')
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not post review')
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <p className="font-medium text-[var(--color-text)]">Write a review</p>
      <Rating value={rating} onChange={setRating} readOnly={false} size={22} />
      <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea label="Your thoughts (optional)" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
      <Button type="submit" disabled={isLoading}>{isLoading ? 'Posting…' : 'Submit review'}</Button>
    </form>
  )
}

/**
 * Product detail route. Gallery + info (title, rating, price, stock, options,
 * qty, add/buy-now/wishlist, delivery info), then Description/Reviews tabs and
 * related products — all fed by the live API.
 */
function ProductDetailScreen() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetProductBySlugQuery(slug, { skip: !slug })
  const product = normalizeProduct(data?.data)
  const { addToCart } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const { isAuthenticated } = useAuth()

  const { data: reviewsData, isLoading: reviewsLoading } = useGetReviewsQuery(product?.id, { skip: !product?.id })
  const reviews = reviewsData?.data || []

  // Backend populates category as { name, slug } — the slug drives the related query.
  const categorySlug = data?.data?.category?.slug
  const { data: relatedData } = useGetProductsQuery(
    { category: categorySlug, limit: 8 },
    { skip: !product || !categorySlug },
  )
  const related = (relatedData?.data || []).map(normalizeProduct)

  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  // Derive defaults instead of initializing once — the product arrives async.
  const activeColor = color ?? product?.colors?.[0]
  const activeSize = size ?? product?.sizes?.[0]

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-64" />
          </div>
        </div>
      </Container>
    )
  }
  if (error || !product) return <NotFoundScreen />

  const wished = isInWishlist(product.id)
  function add() { addToCart(product, qty, { color: activeColor, size: activeSize }); toast.success(`${product.name} added to cart`) }
  function buyNow() { add(); navigate('/checkout') }
  function wish() { toggle(product); toast.success(wished ? 'Removed from wishlist' : 'Saved to wishlist') }

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
          <ProductOptions colors={product.colors} sizes={product.sizes} selectedColor={activeColor} selectedSize={activeSize} onSelectColor={setColor} onSelectSize={setSize} />
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
          { label: `Reviews (${reviews.length})`, content: (
            <div className="max-w-2xl space-y-4">
              {reviewsLoading && <Skeleton className="h-20 w-full" />}
              {reviews.length > 0 && (
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r._id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[var(--color-text)]">{r.title || r.user?.name || 'Customer'}</span>
                        <Rating value={r.rating} size={14} />
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">{r.user?.name} · {new Date(r.createdAt).toLocaleDateString()}</p>
                      {r.title && <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{r.title}</p>}
                      {r.body && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{r.body}</p>}
                    </li>
                  ))}
                </ul>
              )}
              {!reviewsLoading && reviews.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">No reviews yet.</p>}
              {isAuthenticated
                ? <ReviewForm productId={product.id} />
                : <p className="text-sm text-[var(--color-text-subtle)]">Sign in to leave a review.</p>}
            </div>
          ) },
        ]} />
      </div>
      <RelatedProducts products={related} currentId={product.id} />
    </Container>
  )
}

export { ProductDetailScreen }
