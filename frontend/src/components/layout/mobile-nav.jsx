import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Drawer } from '../ui/drawer'
import { closeMobileNav } from '../../features/ui'
import { useGetCategoryTreeQuery } from '../../features/shop/shopApiSlice'

export function MobileNav() {
  const open = useSelector((s) => s.ui.mobileNavOpen)
  const dispatch = useDispatch()
  const { data } = useGetCategoryTreeQuery()
  const categories = data?.data || []
  return (
    <Drawer open={open} onClose={() => dispatch(closeMobileNav())} side="left" title="Menu">
      <nav className="flex flex-col gap-1 p-4" onClick={() => dispatch(closeMobileNav())}>
        <Link to="/" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">Home</Link>
        <Link to="/shop" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">Shop</Link>
        <Link to="/about" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">About</Link>
        <Link to="/contact" className="rounded-md px-3 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]">Contact</Link>
        <div className="my-2 h-px bg-[var(--color-border)]" />
        <p className="px-3 pb-1 text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">Categories</p>
        {categories.map((c) => (
          <Link key={c.slug} to={`/shop?category=${encodeURIComponent(c.name)}`} className="rounded-md px-3 py-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]">{c.name}</Link>
        ))}
      </nav>
    </Drawer>
  )
}
