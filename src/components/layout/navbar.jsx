import { Link, NavLink } from 'react-router-dom'
import { Heart, ShoppingBag, User, Menu } from 'lucide-react'
import { Container } from '../ui/container'
import { Button } from '../ui/button'
import { AnnouncementBar } from './announcement-bar'
import { SearchBar } from './search-bar'
import { MegaMenu } from './mega-menu'
import { useCart, useWishlist } from '../../hooks'
import { useDispatch } from 'react-redux'
import { toggleMobileNav, openCartDrawer } from '../../features/ui'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const { totalItems } = useCart()
  const { count: wishCount } = useWishlist()
  const dispatch = useDispatch()
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <AnnouncementBar />
      <Container className="flex h-16 items-center gap-4">
        <button type="button" className="lg:hidden text-[var(--color-text)]" aria-label="Open menu" onClick={() => dispatch(toggleMobileNav())}>
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="font-display text-xl font-black tracking-tight text-[var(--color-text)]">
          EXCLUSIVE<span className="text-[var(--color-primary)]">.</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 ml-4">
          <MegaMenu />
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block flex-1 flex justify-center">
          <SearchBar />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Account"><Link to="/login"><User className="h-5 w-5" /></Link></Button>
          <Button asChild variant="ghost" size="icon" aria-label={`Wishlist, ${wishCount} items`} className="relative">
            <Link to="/wishlist">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && <CountBadge count={wishCount} />}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Cart, ${totalItems} items`} className="relative" onClick={() => dispatch(openCartDrawer())}>
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && <CountBadge count={totalItems} />}
          </Button>
        </div>
      </Container>
      <div className="md:hidden px-4 pb-3"><SearchBar /></div>
    </header>
  )
}

function CountBadge({ count }) {
  return <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)] nums">{count}</span>
}
