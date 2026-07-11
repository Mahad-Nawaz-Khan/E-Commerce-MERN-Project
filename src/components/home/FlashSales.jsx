import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ui/ProductCard'
import { useProducts } from '@/hooks/useProducts'
import { useCountdown, useStableTarget, pad, DURATIONS } from '@/hooks/useCountdown'

/**
 * Today's Flash Sales section — shows the top "todays-deal" products via the
 * reusable ProductCard, plus a static countdown timer (matching the original).
 * Data comes from the useProducts hook (replaces the Sanity todays-deal query).
 */
function FlashSales() {
  const { todaysDeals } = useProducts()
  const products = todaysDeals.slice(0, 5)

  // Live countdown — 3 days from first mount, ticking every second
  const target = useStableTarget(3 * DURATIONS.DAY)
  const { days, hours, minutes, seconds } = useCountdown(target)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-8 sm:mt-14">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex gap-4 flex-col">
            <div className="flex items-center gap-2">
              <div className="w-4 sm:w-5 h-8 sm:h-10 bg-[#DB4444] rounded-[4px]" />
              <span className="text-[#DB4444] text-sm sm:text-base font-semibold">
                Today&apos;s
              </span>
            </div>

            {/* Countdown (static, as in the original) */}
            <div className="flex gap-4 sm:gap-10 font-extrabold flex-col sm:flex-row">
              <h2 className="text-xl sm:text-2xl">Flash Sales</h2>
              <div className="flex items-center gap-3 sm:gap-6 text-sm sm:text-base">
                {[
                  [pad(days), 'Days'],
                  [pad(hours), 'Hours'],
                  [pad(minutes), 'Minutes'],
                  [pad(seconds), 'Seconds'],
                ].map(([value, label], i, arr) => (
                  <div key={label} className="flex items-center gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="font-bold">{value}</div>
                      <div className="text-xs text-[#666666]">{label}</div>
                    </div>
                    {i < arr.length - 1 && <div className="font-bold">:</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-[#00000066]"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-[#00000066]"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-[30px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showNewBadge={false} />
          ))}
        </div>
      </div>
    </section>
  )
}

export { FlashSales }
