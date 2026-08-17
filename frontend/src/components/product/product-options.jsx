import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export function ProductOptions({ colors = [], sizes = [], selectedColor, selectedSize, onSelectColor, onSelectSize }) {
  return (
    <div className="flex flex-col gap-4">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const sel = selectedColor?.name === c.name
              return (
                <button key={c.name} type="button" aria-label={c.name} onClick={() => onSelectColor(c)} title={c.name}
                  className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full border-2', sel ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]')}
                  style={{ backgroundColor: c.value }}>
                  {sel && <Check className="h-4 w-4 text-white mix-blend-difference" strokeWidth={3} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Option</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const sel = selectedSize === s
              return (
                <button key={s} type="button" onClick={() => onSelectSize(s)} disabled={false}
                  className={cn('rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 disabled:pointer-events-none',
                    sel ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]')}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
