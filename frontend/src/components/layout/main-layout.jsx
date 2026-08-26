import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './navbar'
import { Footer } from './footer'
import { CartDrawer } from '../../features/cart/components/cart-drawer'
import { MobileNav } from './mobile-nav'

/**
 * Site chrome: Navbar + MobileNav + main + Footer + CartDrawer.
 * Used both as a layout route (renders <Outlet />) and as a wrapper element
 * (renders children) — the latter lets nested dashboards reuse the chrome.
 */
export function MainLayout({ children }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <MobileNav />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
