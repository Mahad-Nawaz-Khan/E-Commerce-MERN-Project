import { cva } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', {
  variants: {
    tone: {
      gold: 'bg-[var(--color-primary)] text-[var(--color-on-primary)]',
      sale: 'bg-[var(--color-sale)] text-white',
      success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
      neutral: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
      outline: 'border border-[var(--color-border-strong)] text-[var(--color-text)]',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function Badge({ tone, className, children }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>
}
