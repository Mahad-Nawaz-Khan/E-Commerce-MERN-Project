import { cn } from '../../lib/cn'
export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-medium text-[var(--color-text)]', className)} {...props} />
}
