import { useState } from 'react'
import { cn } from '../../lib/cn'

export function Tabs({ tabs, defaultIndex = 0, className }) {
  const [idx, setIdx] = useState(defaultIndex)
  const active = tabs[idx]
  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((t, i) => (
          <button key={i} role="tab" aria-selected={i === idx} onClick={() => setIdx(i)}
            className={cn('-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              i === idx ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">{active?.content}</div>
    </div>
  )
}
