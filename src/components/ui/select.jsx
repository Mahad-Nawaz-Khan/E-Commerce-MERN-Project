import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Select({ label, value, onChange, options, placeholder = 'Select…', error, id }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const autoId = useId()
  const fieldId = id || autoId
  const ref = useRef(null)
  const options_ = options // [{ value, label }]

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function choose(val) { onChange?.(val); setOpen(false) }
  function onKeyDown(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpen(true); return }
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, options_.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(options_[active].value) }
  }

  const selected = options_.find(o => o.value === value)

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={fieldId} className="text-sm font-medium text-[var(--color-text)]">{label}</label>}
      <div ref={ref} className="relative">
        <button
          type="button"
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen(o => !o)}
          onKeyDown={onKeyDown}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-md border bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-text)]',
            'border-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]',
            error && 'border-[var(--color-error)]'
          )}
        >
          <span className={cn(!selected && 'text-[var(--color-text-subtle)]')}>{selected ? selected.label : placeholder}</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <ul role="listbox" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-pop)]">
            {options_.map((opt, i) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(opt.value)}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm',
                  i === active ? 'bg-[var(--color-surface-2)]' : '',
                  opt.value === value ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                )}>
                {opt.label}
                {opt.value === value && <Check className="h-4 w-4" />}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  )
}
