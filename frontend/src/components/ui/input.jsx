import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'

export const Input = forwardRef(function Input({ label, error, hint, id, className, ...props }, ref) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={fieldId} className="text-sm font-medium text-[var(--color-text)]">{label}</label>}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${fieldId}-msg` : undefined}
        className={cn(
          'h-11 w-full rounded-md border bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] transition-colors',
          'border-[var(--color-border)] focus:border-[var(--color-focus)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
          error && 'border-[var(--color-error)] focus:border-[var(--color-error)]',
          className
        )}
        {...props}
      />
      {(hint || error) && (
        <p id={`${fieldId}-msg`} className={cn('text-xs', error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-subtle)]')}>
          {error || hint}
        </p>
      )}
    </div>
  )
})
