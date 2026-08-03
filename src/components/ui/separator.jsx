import { cn } from '../../lib/cn'
export function Separator({ className, orientation = 'horizontal' }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn('bg-[var(--color-border)]', orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full', className)}
    />
  )
}
