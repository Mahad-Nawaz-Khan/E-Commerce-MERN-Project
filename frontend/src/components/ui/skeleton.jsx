import { cn } from '../../lib/cn'
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-[var(--color-surface-2)]', className)} aria-hidden="true" />
}
