import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Skeleton } from './skeleton'
import { EmptyState } from './empty-state'
import { Pagination } from './pagination'

/**
 * Reusable, client-or-server driven table. Pass `rows`, a `columns` array
 * (each: { key, header, cell?, sortValue?, className, align }), and optional
 * `loading`, `empty`, `pagination` ({ page, pageCount, onPageChange }),
 * `selectable` + `onSelectionChange`, and `onRowClick`.
 *
 * Sorting is client-side when `onSortChange` is omitted (uses sortValue);
 * pass `onSortChange` for server-side sorting and `sortable`.
 */
export function DataTable({
  columns,
  rows = [],
  loading = false,
  rowKey = 'id',
  onRowClick,
  empty,
  className,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  pagination,
}) {
  const [internalSort, setInternalSort] = useState({ key: null, dir: 'asc' })

  const sortedRows = useMemo(() => {
    if (!internalSort.key) return rows
    const col = columns.find((c) => c.key === internalSort.key)
    if (!col) return rows
    const getVal = (r) => (col.sortValue ? col.sortValue(r) : r[col.key])
    return [...rows].sort((a, b) => {
      const av = getVal(a)
      const bv = getVal(b)
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return internalSort.dir === 'asc' ? av - bv : bv - av
      return internalSort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
  }, [rows, internalSort, columns])

  const toggleSort = (col) => {
    if (!col.sortable) return
    setInternalSort((s) => s.key === col.key
      ? { key: col.key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key: col.key, dir: 'asc' })
  }

  const allChecked = selectable && rows.length > 0 && selectedIds.length === rows.length
  const toggleAll = () => onSelectionChange?.(allChecked ? [] : rows.map((r) => r[rowKey]))
  const toggleOne = (id) => {
    if (!onSelectionChange) return
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]', className)}>
      {/* Desktop / tablet table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[var(--color-primary)]" aria-label="Select all" />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.headerClassName)}
                >
                  {col.sortable ? (
                    <button type="button" onClick={() => toggleSort(col)} className="inline-flex items-center gap-1 hover:text-[var(--color-text)]">
                      {col.header}
                      <SortIcon active={internalSort.key === col.key} dir={internalSort.dir} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                  {selectable && <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>}
                  {columns.map((col) => <td key={col.key} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[120px]" /></td>)}
                </tr>
              ))
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-2">
                  <EmptyState icon={Inbox} title={empty?.title || 'No records found'} description={empty?.description} />
                </td>
              </tr>
            ) : (
              sortedRows.map((row, ri) => {
                const id = row[rowKey]
                const checked = selectable && selectedIds.includes(id)
                return (
                  <tr
                    key={id ?? ri}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'border-b border-[var(--color-border)] last:border-0 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-[var(--color-surface-2)]/40',
                      checked && 'bg-[var(--color-primary)]/5',
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={checked} onChange={() => toggleOne(id)} className="accent-[var(--color-primary)]" aria-label={`Select row ${ri + 1}`} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-[var(--color-text)]', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.className)}>
                        {col.cell ? col.cell(row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — mirrors the table content for small screens */}
      {!loading && sortedRows.length > 0 && (
        <div className="divide-y divide-[var(--color-border)] md:hidden">
          {sortedRows.map((row, ri) => {
            const id = row[rowKey]
            return (
              <div
                key={id ?? ri}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('space-y-1.5 p-4', onRowClick && 'cursor-pointer active:bg-[var(--color-surface-2)]/40')}
              >
                {columns.filter((c) => !c.hideOnMobile).map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">{col.header}</span>
                    <span className="text-right text-[var(--color-text)]">{col.cell ? col.cell(row) : (row[col.key] ?? '—')}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {pagination && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <Pagination page={pagination.page} pageCount={pagination.pageCount} onChange={pagination.onPageChange} />
        </div>
      )}
    </div>
  )
}

function SortIcon({ active, dir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
  return dir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
}
