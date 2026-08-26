import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetCategoryTreeQuery } from '../../features/shop/shopApiSlice'
import { categoryIcon } from '../../lib/product'

/** Navbar category dropdown fed by GET /categories/tree — children render indented. */
export function MegaMenu() {
  const [open, setOpen] = useState(false)
  const { data } = useGetCategoryTreeQuery()
  const categories = data?.data || []
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
        onClick={() => setOpen(o => !o)} aria-expanded={open}>
        Categories
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-56 overflow-y-auto rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-pop)]">
          {categories.map((c) => {
            const I = categoryIcon(c.slug)
            return (
              <div key={c.slug}>
                <Link to={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-primary)]">
                  <I className="h-4 w-4" /> {c.name}
                </Link>
                {(c.children || []).map((child) => (
                  <Link key={child.slug} to={`/shop?category=${encodeURIComponent(child.name)}`}
                    className="flex items-center gap-2 rounded-sm py-1 pl-8 pr-2 text-[13px] text-[var(--color-text-subtle)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-primary)]">
                    {child.name}
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
