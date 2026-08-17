import { cn } from '../../lib/cn'

/**
 * Generic surface card for dashboards. Midnight surface with optional
 * header (title + action) and footer slots.
 */
export function Card({ title, description, action, children, className, bodyClassName, footer, headerClassName }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]', className)}>
      {(title || action) && (
        <div className={cn('flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4', headerClassName)}>
          <div>
            {title && <h3 className="font-display text-base font-bold text-[var(--color-text)]">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
      {footer && <div className="border-t border-[var(--color-border)] px-5 py-3">{footer}</div>}
    </div>
  )
}
