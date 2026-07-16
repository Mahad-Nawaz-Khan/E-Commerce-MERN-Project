import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { ProductCard } from '../ui/ProductCard'
import { useProducts } from '../../hooks/useProducts'
import { useCountdown, useStableTarget, pad, DURATIONS } from '../../hooks/useCountdown'

/**
 * Today's Flash Sales section — shows the top "todays-deal" products via the
 * reusable ProductCard, plus a static countdown timer (matching the original).
 * Data comes from the useProducts hook (replaces the Sanity todays-deal query).
 */
function FlashSales() {
  const { todaysDeals } = useProducts()
  const [startIndex, setStartIndex] = useState(0)
  const visibleProducts = todaysDeals.slice(startIndex, startIndex + 4)
  const canGoPrevious = startIndex > 0
  const canGoNext = startIndex + 4 < todaysDeals.length

  // Live countdown — 3 days from first mount, ticking every second
  const target = useStableTarget(3 * DURATIONS.DAY)
  const { days, hours, minutes, seconds } = useCountdown(target)

  return (
    <section className="max-w-292.5 mx-auto px-4 sm:px-6 lg:px-0 py-12 sm:py-16 mt-4 sm:mt-12">
      <div className="flex flex-col gap-7">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex gap-4 flex-col">
            <div className="flex items-center gap-2">
              <div className="w-4 sm:w-5 h-8 sm:h-10 bg-[#DB4444] rounded-sm" />
              <span className="text-[#DB4444] text-sm font-semibold">
                Today&apos;s
              </span>
            </div>

            {/* Countdown (static, as in the original) */}
            <div className="flex gap-5 sm:gap-20 font-bold flex-col sm:flex-row sm:items-end">
              <h2 className="text-2xl sm:text-4xl tracking-[0.04em]">Flash Sales</h2>
              <div className="flex items-center gap-2 sm:gap-4 text-sm">
                {[
                  [pad(days), 'Days'],
                  [pad(hours), 'Hours'],
                  [pad(minutes), 'Minutes'],
                  [pad(seconds), 'Seconds'],
                ].map(([value, label], i, arr) => (
                  <div key={label} className="flex items-center gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="text-2.75 font-medium mb-1">{label}</div>
                      <div className="font-bold text-xl leading-none">{value}</div>
                    </div>
                    {i < arr.length - 1 && <div className="font-bold text-[#e07575] text-xl">:</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-0 bg-[#f5f5f5]"
                disabled={!canGoPrevious}
                onClick={() => setStartIndex((index) => Math.max(0, index - 1))}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-0 bg-[#f5f5f5]"
                disabled={!canGoNext}
                onClick={() => setStartIndex((index) => Math.min(todaysDeals.length - 4, index + 1))}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-7.5 lg:justify-items-start">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} showNewBadge={false} />
          ))}
        </div>
        <div className="flex justify-center pt-5"><Link to="/shop"><Button className="h-12 bg-[#DB4444] hover:bg-[#c73838] px-12 text-white rounded-sm">View All Products</Button></Link></div>
      </div>
    </section>
  )
}

export { FlashSales }
