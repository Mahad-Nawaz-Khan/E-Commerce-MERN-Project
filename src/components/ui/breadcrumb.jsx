import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-[var(--color-text-muted)]', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {it.to && !last ? (
                <Link to={it.to} className="hover:text-[var(--color-primary)]">{it.label}</Link>
              ) : (
                <span className={cn(last && 'text-[var(--color-text)]')}>{it.label}</span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-subtle)]" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
