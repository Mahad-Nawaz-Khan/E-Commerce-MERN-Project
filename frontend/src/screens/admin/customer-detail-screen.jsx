import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowLeft, ShoppingBag, DollarSign, Receipt, Calendar } from 'lucide-react'
import { Card, StatCard, StatusBadge, Button, Spinner, DataTable } from '../../components/ui'
import { useGetCustomerHistoryQuery } from '../../features/admin/adminApiSlice'
import { formatPrice, formatNumber, formatDate } from '../../lib/format'

/** Customer detail — profile card, lifetime stats, full order history. */
export function CustomerDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: res, isLoading } = useGetCustomerHistoryQuery(id)

  const orders = useMemo(() => res?.data || [], [res])

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    const aov = orders.length ? totalSpent / orders.length : 0
    const lastOrder = orders.length ? orders[0].createdAt : null
    return { totalSpent, orderCount: orders.length, aov, lastOrder }
  }, [orders])

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-[var(--color-primary)]" /></div>
  if (!orders.length) {
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">No customer/orders found.</p>
          <Button asChild variant="secondary" className="mt-4"><Link to="/admin/customers">Back to customers</Link></Button>
        </div>
      </Card>
    )
  }

  const columns = [
    {
      key: 'id', header: 'Order #',
      cell: (o) => (
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">#{o.trackingNumber || o.id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{formatDate(o.createdAt)}</p>
        </div>
      ),
    },
    { key: 'items', header: 'Items', align: 'center', hideOnMobile: true, cell: (o) => <span className="nums text-[var(--color-text-muted)]">{o.items?.length || 0}</span> },
    { key: 'totalAmount', header: 'Total', align: 'right', cell: (o) => <span className="font-display font-bold text-[var(--color-text)] nums">{formatPrice(o.totalAmount)}</span> },
    { key: 'paymentStatus', header: 'Payment', hideOnMobile: true, cell: (o) => <StatusBadge status={o.paymentStatus} /> },
    { key: 'status', header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
  ]

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate('/admin/customers')} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </button>

      {/* Profile header */}
      <Card>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-black text-[var(--color-on-primary)]">
            C
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-xl font-black text-[var(--color-text)]">Customer</h1>
            <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">{id}</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={formatNumber(stats.orderCount)} />
        <StatCard icon={DollarSign} label="Total Spent" value={formatPrice(stats.totalSpent)} />
        <StatCard icon={Receipt} label="Avg Order" value={formatPrice(stats.aov)} />
        <StatCard icon={Calendar} label="Last Order" value={stats.lastOrder ? formatDate(stats.lastOrder) : '—'} />
      </div>

      {/* Order history */}
      <Card title="Order History">
        <DataTable
          columns={columns}
          rows={orders}
          rowKey="id"
          onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
          empty={{ title: 'No orders', description: 'This customer has not placed any orders.' }}
        />
      </Card>
    </div>
  )
}
