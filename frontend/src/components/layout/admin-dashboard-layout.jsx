import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  FolderTree,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAuth } from '../../hooks'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const { signOut } = useAuth()

  const handleLogout = () => {
    signOut()
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-surface)] transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[var(--color-border)] px-6">
          <h1 className="font-display text-xl font-black tracking-tight text-[var(--color-primary)]">
            Exclusive Admin
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
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

        {/* User menu */}
        <div className="border-t border-[var(--color-border)] p-4">
          <div className="mb-3 rounded-lg bg-[var(--color-surface-2)] p-3">
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary)]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 text-[var(--color-text)] lg:hidden"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Admin Panel</h2>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
