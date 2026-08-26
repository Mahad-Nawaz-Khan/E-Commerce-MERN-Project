import { useId } from 'react'
import { cn } from '../../lib/cn'

export function RadioGroup({ label, value, onChange, options, name, error }) {
  const autoName = useId()
  const groupName = name || autoName
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={label}>
      {label && <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt.value === value
          return (
            <label key={opt.value} className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
              selected ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
            )}>
              <input type="radio" name={groupName} checked={selected} onChange={() => onChange?.(opt.value)} className="peer sr-only" />
              <span className={cn('h-4 w-4 rounded-full border', selected ? 'border-[var(--color-primary)]' : 'border-[var(--color-border-strong)]')}>
                {selected && <span className="m-1 block h-2 w-2 rounded-full bg-[var(--color-primary)]" />}
              </span>
              {opt.label}
            </label>
          )
        })}
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
}
