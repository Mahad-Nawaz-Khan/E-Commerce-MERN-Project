import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ui/ProductCard'
import { useProducts } from '@/hooks/useProducts'

/**
 * Best Selling Products — top 4 "bestseller"-tagged products + a "View All" CTA.
 * Replaces the Sanity bestseller query with the useProducts hook.
 */
function BestSelling() {
  const { bestsellers } = useProducts()
  const products = bestsellers.slice(0, 4)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="w-4 sm:w-5 h-8 sm:h-10 bg-[#DB4444] rounded-[4px]" />
              <span className="text-[#DB4444] text-sm sm:text-base font-semibold">
                This Month
              </span>
            </div>
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl sm:text-2xl font-semibold">Best Selling Products</h2>
              <Button className="bg-[#DB4444] hover:bg-[#DB4444]/90 text-white h-10 sm:h-12 px-8 sm:px-12 rounded-[4px] text-sm sm:text-base font-medium">
                View All
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-[30px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showNewBadge={false} />
          ))}
        </div>
      </div>
    </section>
  )
}

export { BestSelling }
