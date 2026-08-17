import { CheckCircle2, Clock, Package, Truck, Home, XCircle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatDate } from '../../lib/format'

const STATUS_NODE = {
  pending: { icon: Clock, tone: 'text-[var(--color-warning)]', ring: 'bg-[var(--color-warning)]/15' },
  processing: { icon: Loader2, tone: 'text-[#60A5FA]', ring: 'bg-[#3B82F6]/15' },
  shipped: { icon: Truck, tone: 'text-[#818CF8]', ring: 'bg-[#6366F1]/15' },
  delivered: { icon: Home, tone: 'text-[var(--color-success)]', ring: 'bg-[var(--color-success)]/15' },
  cancelled: { icon: XCircle, tone: 'text-[var(--color-sale)]', ring: 'bg-[var(--color-sale)]/15' },
  created: { icon: Package, tone: 'text-[var(--color-primary)]', ring: 'bg-[var(--color-primary)]/15' },
}

/**
 * Vertical order-tracking timeline. Renders each `statusHistory` entry as a
 * node with its label, timestamp, and optional note. `currentStatus` controls
 * which node is highlighted as the active step.
 */
export function Timeline({ events = [], currentStatus, className }) {
  if (!events.length) {
    return <p className="text-sm text-[var(--color-text-muted)]">No status updates yet.</p>
  }

  return (
    <ol className={cn('relative space-y-6', className)}>
      {events.map((evt, i) => {
        const key = String(evt.status).toLowerCase()
        const node = STATUS_NODE[key] || STATUS_NODE.created
        const Icon = node.icon
        const isLast = i === events.length - 1
        const isActive = evt.status === currentStatus
        return (
          <li key={`${evt.status}-${i}`} className="relative flex gap-4 pl-1">
            {!isLast && (
              <span className="absolute left-[19px] top-9 h-[calc(100%+0.5rem)] w-px bg-[var(--color-border)]" aria-hidden="true" />
            )}
            <span className={cn('relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-[var(--color-border)]', node.ring)}>
              <Icon className={cn('h-4.5 w-4.5 h-[18px] w-[18px]', node.tone, key === 'processing' && 'animate-spin')} />
            </span>
            <div className="min-w-0 pt-1.5">
              <p className={cn('text-sm font-semibold capitalize', isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]')}>
                {evt.status}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-subtle)]">{formatDate(evt.timestamp)} · {new Date(evt.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              {evt.note && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{evt.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Compact summary of the canonical order flow (not tied to history events). */
export function OrderFlowSteps({ status, className }) {
  const steps = ['pending', 'processing', 'shipped', 'delivered']
  const cancelled = status === 'cancelled'
  const currentIndex = steps.indexOf(status)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((s, i) => {
        const node = STATUS_NODE[s]
        const Icon = node.icon
        const done = !cancelled && i <= currentIndex
        return (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1', done ? cn(node.ring, 'ring-transparent') : 'bg-[var(--color-surface-2)] ring-[var(--color-border)]')}>
              <Icon className={cn('h-4 w-4', done ? node.tone : 'text-[var(--color-text-subtle)]')} />
            </span>
            {i < steps.length - 1 && <span className={cn('h-px flex-1', done && i < currentIndex ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]')} />}
          </div>
        )
      })}
      {cancelled && (
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-sale)]">
          <XCircle className="h-4 w-4" /> Cancelled
        </span>
      )}
    </div>
  )
}

export { CheckCircle2 }
