import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ui/ProductCard'
import { useProducts } from '@/hooks/useProducts'

const PAGE_SIZE = 8

/**
 * Explore Our Products — shows all products 8 at a time with a "Show More"
 * pagination button (mirrors the original's loadMoreProducts behavior).
 * Uses the reusable ProductCard (NEW badge + rating shown here).
 */
function ExploreProducts() {
  const { all } = useProducts()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const displayedProducts = all.slice(0, visibleCount)
  const hasMore = visibleCount < all.length

  const loadMore = () => setVisibleCount((count) => count + PAGE_SIZE)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 sm:w-5 h-8 sm:h-10 bg-[#DB4444] rounded-[4px]" />
              <span className="text-[#DB4444] text-sm sm:text-base font-semibold">
                Our Products
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold">Explore Our Products</h2>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-[#00000066]">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-[#00000066]">
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-[30px]">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Show More Products Button */}
        {hasMore && (
          <div className="flex justify-center mt-6 sm:mt-10">
            <Button
              className="bg-[#DB4444] hover:bg-[#DB4444]/90 text-white h-10 sm:h-12 px-8 sm:px-12 rounded-[4px] text-sm sm:text-base font-medium"
              onClick={loadMore}
            >
              Show More Products
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export { ExploreProducts }
