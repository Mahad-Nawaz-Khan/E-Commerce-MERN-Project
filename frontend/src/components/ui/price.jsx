import { formatPrice, discountPercent } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Badge } from './badge'

export function Price({ price, originalPrice, size = 'md', showDiscount = true, className }) {
  const hasDiscount = originalPrice && originalPrice > price
  const pct = discountPercent(originalPrice, price)
  const sizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl', xl: 'text-3xl' }
  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('font-display font-bold nums text-[var(--color-text)]', sizes[size])}>{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className={cn('nums text-[var(--color-text-subtle)] line-through', size === 'lg' || size === 'xl' ? 'text-base' : 'text-sm')}>{formatPrice(originalPrice)}</span>
          {showDiscount && <Badge tone="sale">-{pct}%</Badge>}
        </>
      )}
    </div>
  )
}
