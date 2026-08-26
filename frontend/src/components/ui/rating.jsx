import { Star } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Rating({ value = 0, onChange, size = 16, className, readOnly = true }) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} role={readOnly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value} of 5`}>
      {stars.map((s) => {
        const filled = value >= s
        const half = !filled && value >= s - 0.5
        return (
          <button
            key={s}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(s)}
            className={cn(!readOnly && 'cursor-pointer', readOnly && 'cursor-default')}
            aria-label={`${s} star${s > 1 ? 's' : ''}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                filled || half ? 'text-[var(--color-rating)]' : 'text-[var(--color-content-mut)]'
              )}
              fill={filled || half ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        )
      })}
    </div>
  )
}
