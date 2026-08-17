import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  User,
  MapPin,
  ShoppingBag,
  Lock,
  Heart,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/security', label: 'Security', icon: Lock },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
]

export function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-16">
      <div className="container">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-surface-2)] px-4 py-2 text-[var(--color-text)] lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span>Menu</span>
        </button>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside
            className={cn(
              'fixed inset-0 z-50 w-64 bg-[var(--color-surface)] p-6 transition-transform lg:static lg:block lg:bg-transparent lg:p-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}
          >
            {/* Mobile close overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className="relative z-10 lg:sticky lg:top-24">
              {/* User info */}
              <div className="mb-6 rounded-lg bg-[var(--color-surface-2)] p-4">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-lg font-semibold text-[var(--color-primary)]">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-[var(--color-text)]">{user?.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
