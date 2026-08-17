import { useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Checkbox({ checked, onChange, label, id, disabled }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <label htmlFor={fieldId} className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]', disabled && 'opacity-50 pointer-events-none')}>
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <input id={fieldId} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} className="peer sr-only" />
        <span className={cn('h-5 w-5 rounded border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] peer-checked:border-[var(--color-primary)] peer-checked:bg-[var(--color-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-ring)]')} />
        {checked && <Check className="pointer-events-none absolute h-3.5 w-3.5 text-[var(--color-on-primary)]" strokeWidth={3} />}
      </span>
      {label && <span>{label}</span>}
    </label>
  )
}
