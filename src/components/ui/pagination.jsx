import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Pagination({ page, pageCount, onChange, className }) {
  if (pageCount <= 1) return null
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
          className={cn('inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm nums',
            p === page ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]')}>
          {p}
        </button>
      ))}
      <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onChange(page + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
