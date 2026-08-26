import { cn } from '../../lib/cn'
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center', className)}>
      {Icon && <Icon className="h-10 w-10 text-[var(--color-text-subtle)]" />}
      <div>
        <h3 className="font-display text-lg font-bold text-[var(--color-text)]">{title}</h3>
        {description && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
