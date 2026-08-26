import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ShoppingBag, DollarSign, Package, Clock, Search, ArrowRight } from 'lucide-react'
import { Card, StatCard, StatusBadge, Button, Input } from '../../components/ui'
import { useGetUserStatsQuery, useGetOrdersQuery } from '../../features/user/userApiSlice'
import { formatPrice, formatDate } from '../../lib/format'

/** User dashboard overview — quick stats, recent orders, track-by-id, quick actions. */
export function DashboardScreen() {
  const navigate = useNavigate()
  const { data: statsRes, isLoading: statsLoading } = useGetUserStatsQuery()
  const { data: ordersRes, isLoading: ordersLoading } = useGetOrdersQuery()
  const [trackId, setTrackId] = useState('')

  const stats = statsRes?.data || {}
  const orders = (ordersRes?.data || []).slice(0, 5)
  const statusCounts = stats.ordersByStatus || {}
  const activeOrders = (statusCounts.pending || 0) + (statusCounts.processing || 0) + (statusCounts.shipped || 0)

  const goTrack = (e) => {
    e.preventDefault()
    if (trackId.trim()) navigate(`/account/orders/${trackId.trim()}`)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-black text-[var(--color-text)]">My Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Welcome back — here&apos;s your account at a glance.</p>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders ?? '—'} loading={statsLoading} />
        <StatCard icon={Package} label="Items Ordered" value={statusCounts.totalItems ?? '—'} loading={statsLoading} />
        <StatCard icon={DollarSign} label="Total Spent" value={formatPrice(stats.totalSpent)} loading={statsLoading} />
        <StatCard icon={Clock} label="Active Orders" value={activeOrders} loading={statsLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <Card
          className="lg:col-span-2"
          title="Recent Orders"
          action={<Link to="/account/orders" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>}
          bodyClassName="p-0"
        >
          {ordersLoading ? (
            <p className="p-5 text-sm text-[var(--color-text-muted)]">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="p-5 text-sm text-[var(--color-text-muted)]">No orders yet. <Link to="/shop" className="text-[var(--color-primary)] hover:underline">Start shopping →</Link></p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link to={`/account/orders/${o.orderNumber || o.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface-2)]/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">#{o.orderNumber || o.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{formatDate(o.createdAt)} · {o.items?.length || 0} item(s)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-bold text-[var(--color-text)] nums">{formatPrice(o.totalAmount)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Quick actions */}
        <div className="space-y-6">
          <Card title="Track an Order">
            <form onSubmit={goTrack} className="space-y-3">
              <Input placeholder="Enter order #" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
              <Button type="submit" variant="secondary" className="w-full"><Search className="h-4 w-4" /> Track</Button>
            </form>
          </Card>

          <Card title="Quick Links">
            <div className="space-y-2">
              <QuickLink to="/account/orders" icon={ShoppingBag} label="My Orders" />
              <QuickLink to="/account/addresses" icon={Package} label="Addresses" />
              <QuickLink to="/account/profile" icon={ArrowRight} label="Edit Profile" />
              <QuickLink to="/account/wishlist" icon={ArrowRight} label="Wishlist" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]">
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  )
}
