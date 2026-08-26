import { cn } from '../../lib/cn'

/**
 * Dashboard stat card — gold icon chip + label + big tabular-numeral value,
 * optional delta/subtitle. Used in both the user and admin dashboards.
 */
export function StatCard({ icon: Icon, label, value, sublabel, delta, className }) {
  return (
    <div className={cn('rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
          <p className="mt-2 font-display text-2xl font-black tracking-tight text-[var(--color-text)] nums">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{sublabel}</p>}
        </div>
        {Icon && (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {delta != null && (
        <p className={cn('mt-3 text-xs font-medium', delta >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-sale)]')}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% <span className="text-[var(--color-text-subtle)]">vs last period</span>
        </p>
      )}
    </div>
  )
}
