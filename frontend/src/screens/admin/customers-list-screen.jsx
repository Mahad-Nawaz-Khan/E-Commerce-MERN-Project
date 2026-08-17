import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Search } from 'lucide-react'
import { Card, Input, DataTable, StatusBadge } from '../../components/ui'
import { useGetCustomerStatsQuery } from '../../features/admin/adminApiSlice'
import { useDebounce } from '../../hooks'
import { formatPrice, formatNumber, formatDate } from '../../lib/format'

const PAGE_SIZE = 25

/**
 * Customer leaderboard — sorted by Total Spent DESC (top spender first).
 * Server-side paginated so it never loads all customers at once. The #1 row is
 * highlighted with a gold crown to make the top spender obvious.
 */
export function CustomersListScreen() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('totalSpent')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)

  const { data, isLoading } = useGetCustomerStatsQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    sort,
  })

  const customers = data?.data || []
  const pagination = data?.pagination

  // Global rank of the first row on the current page (so page 2 starts at #26).
  const baseRank = (page - 1) * PAGE_SIZE

  const columns = [
    {
      key: 'rank', header: 'Rank', hideOnMobile: true,
      cell: (c) => {
        const rank = baseRank + customers.indexOf(c) + 1
        return rank === 1
          ? <span className="inline-flex items-center gap-1 font-bold text-[var(--color-primary)]"><Crown className="h-4 w-4" /> 1</span>
          : <span className="text-[var(--color-text-muted)] nums">{rank}</span>
      },
    },
    {
      key: 'name', header: 'Customer',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-primary)]">
            {c.name?.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{c.name}</p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'totalOrders', header: 'Orders', align: 'center',
      cell: (c) => <span className="nums">{formatNumber(c.totalOrders)}</span>,
    },
    {
      key: 'totalSpent', header: 'Total Spent', align: 'right',
      cell: (c) => <span className="font-display font-bold text-[var(--color-text)] nums">{formatPrice(c.totalSpent)}</span>,
    },
    {
      key: 'lastOrderDate', header: 'Last Order', align: 'right', hideOnMobile: true,
      cell: (c) => <span className="text-[var(--color-text-muted)]">{c.lastOrderDate ? formatDate(c.lastOrderDate) : '—'}</span>,
    },
    {
      key: 'tier', header: 'Tier', hideOnMobile: true,
      cell: (c) => <StatusBadge variant={tierTone(c.totalSpent)}>{tierLabel(c.totalSpent)}</StatusBadge>,
    },
    {
      key: 'joinDate', header: 'Joined', align: 'right', hideOnMobile: true,
      cell: (c) => <span className="text-[var(--color-text-muted)]">{formatDate(c.joinDate)}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Customers</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Ranked by total spend — top shoppers first.</p>
        </div>
        {pagination && <p className="text-xs text-[var(--color-text-muted)]">{formatNumber(pagination.total)} customers</p>}
      </header>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
            <Input className="pl-9" placeholder="Search by name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div className="flex gap-1.5">
            <SortChip active={sort === 'totalSpent'} onClick={() => { setSort('totalSpent'); setPage(1) }}>By Spend</SortChip>
            <SortChip active={sort === 'totalOrders'} onClick={() => { setSort('totalOrders'); setPage(1) }}>By Orders</SortChip>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={customers}
          rowKey="id"
          loading={isLoading}
          onRowClick={(c) => navigate(`/admin/customers/${c.id}`)}
          pagination={pagination ? { page: pagination.page, pageCount: pagination.pages, onPageChange: setPage } : undefined}
          empty={{ title: 'No customers found', description: 'Try a different search.' }}
        />
      </Card>
    </div>
  )
}

function tierLabel(spent) {
  if (spent >= 1000) return 'VIP'
  if (spent >= 100) return 'Regular'
  return 'New'
}
function tierTone(spent) {
  if (spent >= 1000) return 'warning'
  if (spent >= 100) return 'info'
  return 'neutral'
}

function SortChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ' +
        (active ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}
    >
      {children}
    </button>
  )
}
