import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Minus, Plus, RefreshCcw, Star, Truck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ProductCard } from '../components/ui/ProductCard'
import { useProduct } from '../hooks/useProduct'
import { getProductSummariesByTag, getProductSummaries } from '../data/products'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { NotFoundScreen } from './NotFoundScreen'
import toast from 'react-hot-toast'

/**
 * Product detail route.
 * product from Sanity by slug. Here we look up the static product by slug from
 * the URL param; if not found we render the 404 page at the requested URL.
 */
function ProductDetailScreen() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const product = useProduct(slug)
  const cart = useCart()
  const wishlist = useWishlist()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] ?? '')
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name ?? '')
  const [quantity, setQuantity] = useState(1)

  // Reset selections whenever the active product changes (slug navigation).
  useEffect(() => {
    setSelectedImage(0)
    setSelectedSize(product?.sizes?.[0] ?? '')
    setSelectedColor(product?.colors?.[0]?.name ?? '')
    setQuantity(1)
  }, [product?.id, product?.sizes?.[0], product?.colors?.[0]?.name])

  const relatedProducts = useMemo(
    () => {
      if (!product) return []
      const inCategory = getProductSummaries().filter((item) => item.id !== product.id && item.category === product.category)
      const featured = getProductSummariesByTag('featured').filter((item) => item.id !== product.id)
      const seen = new Set()
      return [...inCategory, ...featured]
        .filter((item) => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })
        .slice(0, 4)
    },
    [product],
  )

  if (!product) return <NotFoundScreen />

  const galleryImages = (product.images?.slice(0, 4) ?? [product.image]).map((image, index) => ({
    id: index,
    image,
    alt: `${product.name} view ${index + 1}`,
  }))
  const inWishlist = wishlist.isInWishlist(product.id)

  const addProduct = () => {
    for (let index = 0; index < quantity; index += 1) cart.addToCart(product)
    toast.success(`${quantity} ${product.name}${quantity > 1 ? ' items' : ''} added to cart!`)
  }

  const buyNow = () => {
    addProduct()
    navigate('/checkout')
  }

  const toggleWishlist = () => {
    wishlist.toggle(product)
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 pt-8 sm:pt-12">
        <Breadcrumb crumbs={[{ label: 'Shop', to: '/shop' }, { label: product.category, to: `/shop?category=${encodeURIComponent(product.category)}` }, { label: product.name }]} />

        <section className="grid grid-cols-1 gap-10 py-8 lg:grid-cols-[570px_1fr] lg:gap-10 lg:py-12">
          <div className="grid grid-cols-[88px_1fr] gap-4 sm:grid-cols-[120px_1fr] sm:gap-7">
            <div className="grid gap-3 sm:gap-4 grid-rows-4">
              {galleryImages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedImage(item.id)}
                  className={`relative overflow-hidden bg-surface p-2 transition outline-offset-2 ${selectedImage === item.id ? 'outline outline-black' : 'hover:bg-surface-hover'}`}
                  aria-label={`Show ${item.alt}`}
                >
                  <img src={item.image} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
            <div className="relative aspect-square overflow-hidden bg-surface p-8 sm:p-12">
              <img src={galleryImages[selectedImage].image} alt={product.name} className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="max-w-100 lg:pt-1">
            <h1 className="font-poppins text-2xl font-semibold tracking-[0.03em]">{product.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <div className="flex text-rating">
                {Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-4 w-4 ${index < Math.floor(product.rating) ? 'fill-current' : 'fill-rating-empty text-rating-empty'}`} />)}
              </div>
              <span className="text-subtle-text">({product.reviews} Reviews)</span>
              <span className="text-subtle-text">|</span>
              <span className="text-stock-success">In Stock</span>
            </div>
            <p className="mt-4 text-2xl tracking-[0.04em]">${product.price.toFixed(2)}</p>
            <p className="mt-4 border-b border-black pb-6 text-xs leading-5 text-body-text">{product.description}</p>

            <fieldset className="mt-6 flex items-center gap-5">
              <legend className="sr-only">Choose a colour</legend>
              <span className="font-poppins text-xl">Colours:</span>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <label key={color.name} htmlFor={`color-${color.name}`} className="relative block cursor-pointer">
                    <input
                      id={`color-${color.name}`}
                      type="radio"
                      name="product-color"
                      value={color.name}
                      aria-label={color.name}
                      checked={selectedColor === color.name}
                      onChange={() => setSelectedColor(color.name)}
                      className="peer sr-only"
                    />
                    <span
                      title={color.name}
                      className="block h-5 w-5 rounded-full border-2 border-transparent p-0.5 transition peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black peer-checked:border-black"
                    >
                      <span className="block h-full w-full rounded-full" style={{ backgroundColor: color.value }} />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5 flex items-center gap-5">
              <legend className="sr-only">Choose a size</legend>
              <span className="font-poppins text-xl">Size:</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <label key={size} htmlFor={`size-${size}`} className="cursor-pointer">
                    <input
                      id={`size-${size}`}
                      type="radio"
                      name="product-size"
                      value={size}
                      aria-label={`Size ${size}`}
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                      className="peer sr-only"
                    />
                    <span className="inline-grid h-8 min-w-8 place-items-center rounded-sm border border-black px-2 text-xs transition peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-secondary-foreground">{size}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 flex gap-4">
              <div className="flex h-11 overflow-hidden rounded-sm border border-black">
                <Button aria-label="Decrease quantity" variant="ghost" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-full! w-10! rounded-none! hover:bg-secondary! hover:text-secondary-foreground! border-r! border-black! p-0!"><Minus className="h-4 w-4" /></Button>
                <span className="grid w-12 place-items-center text-sm font-medium">{quantity}</span>
                <Button aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} className="h-full! w-10! rounded-none! border-l! border-black! bg-primary! p-0! text-black! hover:bg-secondary! hover:text-secondary-foreground!"><Plus className="h-4 w-4" /></Button>
              </div>
              <Button onClick={buyNow} className="h-11 flex-1 rounded-sm bg-secondary px-8 text-secondary-foreground hover:bg-secondary-hover">Buy Now</Button>
              <Button aria-label="Toggle wishlist" variant="outline" size="icon" onClick={toggleWishlist} className={`h-11! w-11! rounded-sm! border-black! ${inWishlist ? 'text-secondary!' : ''}`}><Heart className={inWishlist ? 'fill-current' : ''} /></Button>
            </div>

            <div className="mt-8 overflow-hidden rounded-sm border border-border-strong">
              <div className="flex gap-4 border-b border-border-strong px-4 py-4">
                <Truck className="h-9 w-9 shrink-0" />
                <div><h2 className="text-sm font-medium">Free Delivery</h2><p className="mt-1 text-2.75 underline">Enter your postal code for Delivery Availability</p></div>
              </div>
              <div className="flex gap-4 px-4 py-4">
                <RefreshCcw className="h-8 w-8 shrink-0" />
                <div><h2 className="text-sm font-medium">Return Delivery</h2><p className="mt-1 text-2.75">Free 30 Days Delivery Returns. <span className="underline">Details</span></p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 pt-12 sm:pt-20">
          <div className="mb-8 flex items-center gap-4"><span className="h-10 w-5 rounded-sm bg-secondary" /><span className="text-sm font-semibold text-secondary">Related Item</span></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-7.5 lg:grid-cols-4 lg:justify-items-start">
            {relatedProducts.map((item) => <ProductCard key={item.id} product={item} showNewBadge={false} />)}
          </div>
        </section>
      </div>
    </main>
  )
}

export { ProductDetailScreen }
