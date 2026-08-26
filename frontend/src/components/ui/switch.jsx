import { useId } from 'react'
import { cn } from '../../lib/cn'
export function Switch({ checked, onChange, label, id }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <label htmlFor={fieldId} className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
      <span className="relative inline-flex h-6 w-11 items-center">
        <input id={fieldId} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange?.(e.target.checked)} className="peer sr-only" />
        <span className={cn('h-6 w-11 rounded-full bg-[var(--color-surface-2)] transition-colors peer-checked:bg-[var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-ring)]')} />
        <span className={cn('absolute left-0.5 h-5 w-5 rounded-full bg-[var(--color-content)] transition-transform peer-checked:translate-x-5')} />
      </span>
      {label && <span>{label}</span>}
    </label>
  )
}
