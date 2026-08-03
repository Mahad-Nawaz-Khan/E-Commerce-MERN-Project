import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/categories'
import * as Icon from 'lucide-react'

export function MegaMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
        onClick={() => setOpen(o => !o)} aria-expanded={open}>
        Categories
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-pop)]">
          {categories.map((c) => {
            const I = Icon[c.icon] || Icon.Tag
            return (
              <Link key={c.slug} to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-primary)]">
                <I className="h-4 w-4" /> {c.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
