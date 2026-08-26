import { Link } from 'react-router-dom'
import { Section, Container, Button } from '../ui'
import { ProductGrid } from '../product/product-grid'
import { useProducts } from '../../hooks'

/** Best selling — bestsellers.slice(0,4) via ProductGrid + a "View all" CTA. */
export function BestSelling() {
  const { bestsellers, isLoading } = useProducts()
  const top = bestsellers.slice(0, 4)
  if (!isLoading && top.length === 0) return null
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-sm bg-[var(--color-primary)]" />
            <h2 className="font-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">Best selling</h2>
          </div>
          <Button asChild variant="link" className="hidden sm:inline-flex"><Link to="/shop">View all</Link></Button>
        </div>
        <ProductGrid products={top} loading={isLoading} columns={4} />
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline"><Link to="/shop">View all</Link></Button>
        </div>
      </Container>
    </Section>
  )
}
