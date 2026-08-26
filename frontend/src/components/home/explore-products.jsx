import { useState } from 'react'
import { Section, Container, Button } from '../ui'
import { ProductGrid } from '../product/product-grid'
import { useProducts } from '../../hooks'

const PAGE_SIZE = 8

/** Explore products — "Show more" pagination over the live catalog. */
export function ExploreProducts() {
  const { all, isLoading } = useProducts()
  const [visible, setVisible] = useState(PAGE_SIZE)
  const items = all.slice(0, visible)
  const hasMore = visible < all.length
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-sm bg-[var(--color-primary)]" />
          <h2 className="font-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">Explore the showroom</h2>
        </div>
        <ProductGrid products={items} loading={isLoading} columns={4} />
        {hasMore && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Show more</Button>
          </div>
        )}
      </Container>
    </Section>
  )
}
