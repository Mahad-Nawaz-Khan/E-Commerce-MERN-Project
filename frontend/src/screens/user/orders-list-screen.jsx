import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Search } from 'lucide-react'
import { Card, StatusBadge, Input, EmptyState } from '../../components/ui'
import { useGetOrdersQuery } from '../../features/user/userApiSlice'
import { formatPrice, formatDate } from '../../lib/format'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

/** Order history with status filter tabs and search. */
export function OrdersListScreen() {
  const navigate = useNavigate()
  const { data: ordersRes, isLoading } = useGetOrdersQuery()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const orders = useMemo(() => {
    let list = ordersRes?.data || []
    if (filter !== 'all') list = list.filter((o) => o.status === filter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((o) =>
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
        o.id.toLowerCase().includes(q))
    }
    return list
  }, [ordersRes, filter, query])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-black text-[var(--color-text)]">My Orders</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Track, review, and manage all your orders.</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ' +
                (filter === f.key
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <Input className="pl-9" placeholder="Search order #" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <Card><p className="text-sm text-[var(--color-text-muted)]">Loading orders…</p></Card>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState icon={ShoppingBag} title="No orders found" description="When you place an order it will show up here." />
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const firstItem = order.items?.[0]
            const thumb = firstItem?.product?.images?.[0]
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/account/orders/${order.orderNumber || order.id}`)}
                className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--color-surface-2)]">
                    {thumb ? (
                      <img src={imgUrl(thumb)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-[var(--color-text-subtle)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                      </p>
                      <span className="font-display text-sm font-bold text-[var(--color-text)] nums">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-[var(--color-text-muted)]">
                        {formatDate(order.createdAt)} · {order.items?.length || 0} item(s)
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Resolve a product image path (seed data uses "/images/...", uploads use "/uploads/..."). */
function imgUrl(p) {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('/uploads') || p.startsWith('/images')) return p
  return `/images/products/${p}`
}
