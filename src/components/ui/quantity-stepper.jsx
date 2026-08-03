import { Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/cn'

export function QuantityStepper({ value, min = 1, max = 99, onChange, size = 'md', className }) {
  const sizes = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
  const btn = 'inline-flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:pointer-events-none'
  return (
    <div className={cn('inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)]', sizes[size], className)}>
      <button type="button" aria-label="Decrease quantity" className={cn(btn, 'px-2.5')} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[2ch] text-center font-display text-sm font-semibold nums text-[var(--color-text)]">{value}</span>
      <button type="button" aria-label="Increase quantity" className={cn(btn, 'px-2.5')} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
