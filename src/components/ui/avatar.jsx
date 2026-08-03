import { cn } from '../../lib/cn'
export function Avatar({ src, alt = '', fallback = '', className }) {
  return (
    <span className={cn('inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]', className)}>
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : <span className="font-display font-bold">{fallback || alt.charAt(0)}</span>}
    </span>
  )
}
