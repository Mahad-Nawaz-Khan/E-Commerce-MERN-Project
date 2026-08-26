import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card, Input, DataTable, StatusBadge } from '../../components/ui'
import { useGetAdminOrdersQuery } from '../../features/admin/adminApiSlice'
import { useDebounce } from '../../hooks'
import { formatPrice, formatDate } from '../../lib/format'

const PAGE_SIZE = 25
const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENTS = ['all', 'pending', 'paid', 'failed', 'refunded']

/** Admin order list — paginated with status/payment filters + customer search. */
export function OrdersListScreen() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)

  const { data, isLoading } = useGetAdminOrdersQuery({ page, limit: PAGE_SIZE, status, paymentStatus, search: debouncedSearch })
  const orders = data?.data || []
  const pagination = data?.pagination

  const columns = [
    {
      key: 'id', header: 'Order #',
      cell: (o) => (
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">#{o.trackingNumber || o.orderNumber || (o.id || o._id || '').slice(-8).toUpperCase()}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{formatDate(o.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'user', header: 'Customer',
      cell: (o) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-[var(--color-text)]">{o.user?.name || '—'}</p>
          <p className="truncate text-xs text-[var(--color-text-muted)]">{o.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'items', header: 'Items', align: 'center', hideOnMobile: true,
      cell: (o) => <span className="nums text-[var(--color-text-muted)]">{o.items?.length || 0}</span>,
    },
    {
      key: 'totalAmount', header: 'Total', align: 'right',
      cell: (o) => <span className="font-display font-bold text-[var(--color-text)] nums">{formatPrice(o.totalAmount)}</span>,
    },
    {
      key: 'paymentStatus', header: 'Payment', hideOnMobile: true,
      cell: (o) => <StatusBadge status={o.paymentStatus} />,
    },
    {
      key: 'status', header: 'Status',
      cell: (o) => <StatusBadge status={o.status} />,
    },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Orders</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Monitor and fulfil customer orders.</p>
      </header>

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button key={s} type="button" onClick={() => { setStatus(s); setPage(1) }}
                className={'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ' +
                  (status === s ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SelectBare value={paymentStatus} onChange={(v) => { setPaymentStatus(v); setPage(1) }} options={PAYMENTS} label="Payment" />
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
              <Input className="pl-9" placeholder="Search customer" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={orders}
          rowKey="id"
          loading={isLoading}
          onRowClick={(o) => navigate(`/admin/orders/${o.orderNumber || o.id || o._id}`)}
          pagination={pagination ? { page: pagination.page, pageCount: pagination.pages, onPageChange: setPage } : undefined}
          empty={{ title: 'No orders found', description: 'Try adjusting filters.' }}
        />
      </Card>
    </div>
  )
}

function SelectBare({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 pr-8 text-sm capitalize text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
      >
        {options.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  )
}
