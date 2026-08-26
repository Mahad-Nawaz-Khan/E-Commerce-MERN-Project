import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

/**
 * Maps an order or payment status to a colored pill. Shared across the user
 * and admin panels. `variant` can be passed explicitly, otherwise inferred
 * from the `status` string.
 */
const TONES = {
  // Order lifecycle
  pending: 'warning',
  processing: 'info',
  shipped: 'indigo',
  delivered: 'success',
  cancelled: 'danger',
  // Payment
  paid: 'success',
  failed: 'danger',
  refunded: 'neutral',
  // Generic
  active: 'success',
  inactive: 'neutral',
}

const statusVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', {
  variants: {
    tone: {
      warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
      info: 'bg-[#3B82F6]/15 text-[#60A5FA]',
      indigo: 'bg-[#6366F1]/15 text-[#818CF8]',
      success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
      danger: 'bg-[var(--color-sale)]/15 text-[var(--color-sale)]',
      neutral: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function StatusBadge({ status, variant, className, children }) {
  const tone = variant || TONES[String(status || '').toLowerCase()] || 'neutral'
  const label = children || toTitleCase(status)
  return <span className={cn(statusVariants({ tone }), className)}>{label}</span>
}

function toTitleCase(s) {
  if (!s) return ''
  return String(s).replace(/\b\w/g, (c) => c.toUpperCase())
}
