import { Skeleton } from '../ui'
import { ProductCard } from './product-card'
import { cn } from '../../lib/cn'

export function ProductGrid({ products, loading, variant, columns = 4, className }) {
  const cols = { 3: 'grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4', 5: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' }
  if (loading) {
    return <div className={cn('grid gap-4', cols[columns], className)}>
      {Array.from({ length: columns === 5 ? 5 : 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="mt-3 h-3 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  }
  return (
    <div className={cn('grid gap-4', cols[columns], className)}>
      {products.map((p) => <ProductCard key={p.id} product={p} variant={variant} />)}
    </div>
  )
}
