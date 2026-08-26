import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Heart, ShoppingBag, User, Menu, ChevronDown, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react'
import { Container } from '../ui/container'
import { Button } from '../ui/button'
import { AnnouncementBar } from './announcement-bar'
import { SearchBar } from './search-bar'
import { MegaMenu } from './mega-menu'
import { NotificationsBell } from './notifications-bell'
import { useCart, useWishlist, useAuth } from '../../hooks'
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
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()

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
          {isAuthenticated ? (
            <AccountMenu user={user} isAdmin={isAdmin} onSignOut={signOut} />
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Log in"><Link to="/login"><User className="h-5 w-5" /></Link></Button>
          )}
          <NotificationsBell />
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

/** Account dropdown for authenticated users — dashboard, admin (if admin), sign out. */
function AccountMenu({ user, isAdmin, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)]"
        aria-label="Account menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--color-on-primary)]">
          {initial}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-[var(--color-text-muted)] sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)]">
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user?.name}</p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">{user?.email}</p>
          </div>
          <div className="py-1">
            <MenuLink to="/account" icon={LayoutDashboard} onClick={() => setOpen(false)}>My Dashboard</MenuLink>
            {isAdmin && <MenuLink to="/admin" icon={ShieldCheck} onClick={() => setOpen(false)}>Admin Panel</MenuLink>}
          </div>
          <div className="border-t border-[var(--color-border)] py-1">
            <button
              type="button"
              onClick={() => { setOpen(false); onSignOut() }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
    >
      <Icon className="h-4 w-4" /> {children}
    </Link>
  )
}

function CountBadge({ count }) {
  return <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)] nums">{count}</span>
}
