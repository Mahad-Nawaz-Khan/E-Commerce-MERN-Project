import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, StatCard, StatusBadge, Gauge, LineTrend, Spinner } from '../../components/ui'
import {
  useGetSalesOverviewQuery,
  useGetSalesTrendsQuery,
  useGetCustomerCountQuery,
} from '../../features/admin/adminApiSlice'
import { formatPrice, formatNumber, formatDate } from '../../lib/format'

/**
 * Admin dashboard overview.
 *  - 4 stat cards (revenue, orders, customers, low-stock)
 *  - half-circle gauge + fulfillment + status breakdown
 *  - sales trend line chart (last 30d)
 *  - recent orders + top products
 */
export function AdminDashboardScreen() {
  const { data: overviewRes, isLoading: overviewLoading } = useGetSalesOverviewQuery()
  const { data: trendsRes, isLoading: trendsLoading } = useGetSalesTrendsQuery('30d')
  const { data: customerCountRes } = useGetCustomerCountQuery()

  const o = overviewRes?.data
  const customerCount = customerCountRes?.data?.total ?? 0

  if (overviewLoading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-[var(--color-primary)]" /></div>
  }

  const statusBreakdown = o?.statusBreakdown || {}
  const totalOrders = o?.allTime?.totalOrders || 0
  const delivered = statusBreakdown.delivered || 0
  const fulfillmentRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0

  // Revenue progress vs a monthly goal (configurable default).
  const monthlyGoal = 50000
  const last30Revenue = o?.last30Days?.revenue || 0
  const revenuePct = Math.min(100, Math.round((last30Revenue / monthlyGoal) * 100))

  // Format sales trends for the line chart.
  const trendData = (trendsRes?.data || []).map((t) => ({
    date: formatDate(t.date).split(',')[0],
    revenue: Math.round(t.revenue),
    orders: t.orders,
  }))

  const recentOrders = o?.recentOrders || []
  const topProducts = o?.topProducts || []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Store performance at a glance.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(o?.allTime?.totalRevenue)} sublabel={`${formatPrice(last30Revenue)} last 30d`} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={formatNumber(totalOrders)} sublabel={`${o?.last30Days?.orders || 0} last 30d`} />
        <StatCard icon={Users} label="Customers" value={formatNumber(customerCount)} sublabel="Registered accounts" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={formatNumber(o?.lowStockCount || 0)} sublabel="Needs restocking" className={o?.lowStockCount ? 'ring-1 ring-[var(--color-warning)]/30' : ''} />
      </div>

      {/* Gauge charts + status breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Revenue vs Goal" description={`Goal: ${formatPrice(monthlyGoal)}/mo`}>
          <Gauge value={revenuePct} max={100} label={`${formatPrice(last30Revenue)} of ${formatPrice(monthlyGoal)}`} color="#E8B339" />
        </Card>
        <Card title="Fulfillment Rate" description="Delivered / total orders">
          <Gauge value={fulfillmentRate} max={100} label={`${delivered} delivered`} color="#34D399" />
        </Card>
        <Card title="Order Status" description="Across all orders">
          <div className="space-y-2 pt-2">
            <StatusRow label="Pending" count={statusBreakdown.pending} total={totalOrders} tone="#F59E0B" />
            <StatusRow label="Processing" count={statusBreakdown.processing} total={totalOrders} tone="#60A5FA" />
            <StatusRow label="Shipped" count={statusBreakdown.shipped} total={totalOrders} tone="#818CF8" />
            <StatusRow label="Delivered" count={statusBreakdown.delivered} total={totalOrders} tone="#34D399" />
            <StatusRow label="Cancelled" count={statusBreakdown.cancelled} total={totalOrders} tone="#FF4D4D" />
          </div>
        </Card>
      </div>

      {/* Sales trend */}
      <Card title="Sales Trend" description="Revenue & orders — last 30 days" action={<TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />}>
        {trendsLoading ? (
          <div className="h-[280px] animate-pulse rounded-md bg-[var(--color-surface-2)]" />
        ) : trendData.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">No sales in this period yet.</p>
        ) : (
          <LineTrend data={trendData} series={[{ key: 'revenue', name: 'Revenue', color: '#E8B339' }]} valueFormatter={(v) => `$${v}`} />
        )}
      </Card>

      {/* Recent orders + top products */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent Orders" action={<Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>} bodyClassName="p-0">
          {recentOrders.length === 0 ? (
            <p className="p-5 text-sm text-[var(--color-text-muted)]">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {recentOrders.slice(0, 6).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">#{order.trackingNumber || order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-bold text-[var(--color-text)] nums">{formatPrice(order.totalAmount)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top Products" description="By revenue" action={<Link to="/admin/analytics" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline">Details <ArrowRight className="h-3 w-3" /></Link>} bodyClassName="p-0">
          {topProducts.length === 0 ? (
            <p className="p-5 text-sm text-[var(--color-text-muted)]">No product sales yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {topProducts.map((p, i) => (
                <li key={p.productId || i} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text)]">{p.name}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">{p.quantity} sold</span>
                  <span className="w-20 text-right font-display text-sm font-bold text-[var(--color-text)] nums">{formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function StatusRow({ label, count, total, tone }) {
  const pct = total > 0 ? Math.round(((count || 0) / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className="font-medium text-[var(--color-text)] nums">{count || 0}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: tone }} />
      </div>
    </div>
  )
}
