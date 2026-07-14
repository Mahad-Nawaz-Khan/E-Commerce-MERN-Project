import { useParams, Navigate } from 'react-router-dom'
import { Star, Truck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { useProduct } from '@/hooks/useProduct'

/**
 * Product detail route — the original was an SSR page that fetched a single
 * product from Sanity by slug. Here we look up the static product by slug from
 * the URL param; if not found we redirect to the 404 page.
 */
function ProductDetailScreen() {
  const { slug } = useParams()
  const product = useProduct(slug)

  if (!product) {
    return <Navigate to="/404" replace />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumb
        crumbs={[
          { label: 'Home', to: '/' },
          { label: product.category, to: '/' },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg text-gray-600">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-red-600">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xl text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-lg text-gray-700">{product.description}</p>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <Button key={size} variant="outline" className="px-6 py-3 text-lg">
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <AddToCartButton product={product} />

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div className="flex items-center gap-3 text-lg text-gray-700">
              <Truck className="w-6 h-6 text-green-500" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-3 text-lg text-gray-700">
              <ArrowRight className="w-6 h-6 text-green-500" />
              <span>30-day hassle-free return policy</span>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { ProductDetailScreen }
