import { useState } from 'react'
import { BarChart3, Boxes, ShoppingCart, Users } from 'lucide-react'
import { Card, Tabs, DonutChart, BarChartMini, LineTrend, StatCard, Spinner } from '../../components/ui'
import {
  useGetSalesOverviewQuery,
  useGetSalesTrendsQuery,
  useGetInventoryStatsQuery,
  useGetCategoryAnalyticsQuery,
  useGetCustomerStatsQuery,
} from '../../features/admin/adminApiSlice'
import { formatPrice, formatNumber, formatDate } from '../../lib/format'

const PERIODS = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
]

/** Analytics & Reports — Sales / Inventory / Orders / Customers tabs. */
export function AnalyticsScreen() {
  const [period, setPeriod] = useState('30d')

  const tabs = [
    { label: 'Sales', icon: BarChart3, content: <SalesTab period={period} /> },
    { label: 'Inventory', icon: Boxes, content: <InventoryTab /> },
    { label: 'Orders', icon: ShoppingCart, content: <OrdersTab period={period} /> },
    { label: 'Customers', icon: Users, content: <CustomersTab /> },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Deep-dive into store performance.</p>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
              className={'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ' +
                (period === p.key ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}>
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <Card><Tabs tabs={tabs} /></Card>
    </div>
  )
}

function SalesTab({ period }) {
  const { data: oRes, isLoading: oLoading } = useGetSalesOverviewQuery()
  const { data: tRes, isLoading: tLoading } = useGetSalesTrendsQuery(period)
  const { data: cRes } = useGetCategoryAnalyticsQuery()

  if (oLoading) return <Spinner className="mx-auto h-8 w-8 text-[var(--color-primary)]" />

  const o = oRes?.data || {}
  const trendData = (tRes?.data || []).map((t) => ({ date: formatDate(t.date).split(',')[0], revenue: Math.round(t.revenue), orders: t.orders }))
  const paymentData = (o.paymentMethodRevenue || []).map((p) => ({ name: p._id, value: Math.round(p.revenue) }))
  const categoryData = (cRes?.data || []).slice(0, 8).map((c) => ({ name: c.categoryName, value: Math.round(c.revenue) }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatPrice(o.allTime?.totalRevenue)} />
        <StatCard label="Total Orders" value={formatNumber(o.allTime?.totalOrders)} />
        <StatCard label="Avg Order Value" value={formatPrice(o.allTime?.avgOrderValue)} />
        <StatCard label="Revenue (period)" value={formatPrice(period === '7d' ? o.last7Days?.revenue : o.last30Days?.revenue)} />
      </div>

      <Card title="Revenue Trend" description={`Last ${period}`}>
        {tLoading ? <div className="h-[280px] animate-pulse rounded-md bg-[var(--color-surface-2)]" /> :
          trendData.length ? <LineTrend data={trendData} series={[{ key: 'revenue', name: 'Revenue', color: '#E8B339' }]} valueFormatter={(v) => `$${v}`} /> :
          <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">No data for this period.</p>}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Revenue by Payment Method">
          {paymentData.length ? <DonutChart data={paymentData} valueFormatter={(v) => formatPrice(v)} /> : <Empty />}
        </Card>
        <Card title="Revenue by Category" description="Top 8">
          {categoryData.length ? <BarChartMini data={categoryData} layout="vertical" valueFormatter={(v) => `$${v}`} /> : <Empty />}
        </Card>
      </div>
    </div>
  )
}

function InventoryTab() {
  const { data, isLoading } = useGetInventoryStatsQuery({ page: 1, limit: 25 })
  if (isLoading) return <Spinner className="mx-auto h-8 w-8 text-[var(--color-primary)]" />
  const d = data?.data || {}
  // Stock distribution from the $bucket result: buckets are [0,1), [1,11), [11,51), [51,101), [101,∞).
  const dist = (d.stockDistribution || []).map((b, i) => ({
    name: distLabel(i),
    value: b.count || 0,
  }))
  const products = d.products || []
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Stock Value" value={formatPrice(d.totalStockValue)} />
        <StatCard label="Low Stock" value={formatNumber(d.lowStockCount)} />
        <StatCard label="Out of Stock" value={formatNumber(d.outOfStockCount)} />
        <StatCard label="Tracked Products" value={formatNumber(products.length)} />
      </div>
      <Card title="Stock Distribution" description="Products grouped by stock range (least → most)">
        {dist.length ? <BarChartMini data={dist} valueFormatter={(v) => `${v} items`} /> : <Empty />}
      </Card>
      <Card title="Lowest Stock Products" bodyClassName="p-0">
        <ul className="divide-y divide-[var(--color-border)]">
          {products.slice(0, 10).map((p) => (
            <li key={p.id} className="flex items-center justify-between px-5 py-3">
              <span className="truncate text-sm font-medium text-[var(--color-text)]">{p.name}</span>
              <span className={'font-display text-sm font-bold nums ' + (p.stock === 0 ? 'text-[var(--color-sale)]' : p.stock <= 10 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text)]')}>{p.stock}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function OrdersTab({ period }) {
  const { data: oRes, isLoading } = useGetSalesOverviewQuery()
  const { data: tRes } = useGetSalesTrendsQuery(period)
  if (isLoading) return <Spinner className="mx-auto h-8 w-8 text-[var(--color-primary)]" />
  const o = oRes?.data || {}
  const breakdown = o.statusBreakdown || {}
  const statusData = Object.entries(breakdown).map(([name, value]) => ({ name, value }))
  const trendData = (tRes?.data || []).map((t) => ({ date: formatDate(t.date).split(',')[0], orders: t.orders }))
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Orders" value={formatNumber(o.allTime?.totalOrders)} />
        <StatCard label="Delivered" value={formatNumber(breakdown.delivered || 0)} />
        <StatCard label="Pending" value={formatNumber(breakdown.pending || 0)} />
        <StatCard label="Cancelled" value={formatNumber(breakdown.cancelled || 0)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Order Status Breakdown">
          {statusData.length ? <DonutChart data={statusData} /> : <Empty />}
        </Card>
        <Card title="Order Volume Trend" description={`Last ${period}`}>
          {trendData.length ? <LineTrend data={trendData} area={false} series={[{ key: 'orders', name: 'Orders', color: '#818CF8' }]} /> : <Empty />}
        </Card>
      </div>
    </div>
  )
}

function CustomersTab() {
  const { data, isLoading } = useGetCustomerStatsQuery({ page: 1, limit: 100, sort: 'totalSpent' })
  if (isLoading) return <Spinner className="mx-auto h-8 w-8 text-[var(--color-primary)]" />
  const customers = data?.data || []
  const segments = { VIP: 0, Regular: 0, New: 0 }
  customers.forEach((c) => {
    if (c.totalSpent >= 1000) segments.VIP++
    else if (c.totalSpent >= 100) segments.Regular++
    else segments.New++
  })
  const segData = Object.entries(segments).map(([name, value]) => ({ name, value }))
  const repeat = customers.filter((c) => c.totalOrders > 1).length
  const repeatRate = customers.length ? Math.round((repeat / customers.length) * 100) : 0
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Customers" value={formatNumber(customers.length)} />
        <StatCard label="VIP (≥$1000)" value={formatNumber(segments.VIP)} />
        <StatCard label="Repeat Customers" value={formatNumber(repeat)} />
        <StatCard label="Repeat Rate" value={`${repeatRate}%`} />
      </div>
      <Card title="Customer Segmentation" description="By lifetime spend tier">
        {segData.length ? <DonutChart data={segData} /> : <Empty />}
      </Card>
    </div>
  )
}

function distLabel(i) {
  return ['Out (0)', '1–10', '11–50', '51–100', '100+'][i] || `Range ${i}`
}
function Empty() {
  return <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">No data available yet.</p>
}
