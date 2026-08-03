import { Link } from 'react-router-dom'
import { Section, Container, Button, ProductGrid } from '../ui'
import { useProducts, useCountdown, useStableTarget } from '../../hooks'
import { Flame } from 'lucide-react'

/** Flash sales — live countdown + grid of today's deals with a "View all" CTA. */
export function FlashSales() {
  const { todaysDeals } = useProducts()
  const target = useStableTarget(3 * 24 * 60 * 60 * 1000) // 3 days
  const t = useCountdown(target)
  const deals = todaysDeals.slice(0, 4)
  if (deals.length === 0) return null
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-sale)]">
              <Flame className="h-4 w-4" /> Flash Sales
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">Today's deals</h2>
          </div>
          <div className="flex items-center gap-2">
            {[['D', t.days], ['H', t.hours], ['M', t.minutes], ['S', t.seconds]].map(([label, val]) => (
              <div key={label} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1.5 text-center">
                <p className="font-display text-base font-bold nums text-[var(--color-text)]">{String(val).padStart(2, '0')}</p>
                <p className="text-[9px] uppercase tracking-wide text-[var(--color-text-subtle)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <ProductGrid products={deals} columns={4} />
        <div className="mt-8 text-center">
          <Button asChild variant="outline"><Link to="/shop">View all deals</Link></Button>
        </div>
      </Container>
    </Section>
  )
}
