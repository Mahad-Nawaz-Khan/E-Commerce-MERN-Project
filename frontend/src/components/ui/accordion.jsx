import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Accordion({ items, className }) {
  const [open, setOpen] = useState(null)
  return (
    <div className={cn('divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]', className)}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left font-medium text-[var(--color-text)]">
              <span>{it.question}</span>
              <ChevronDown className={cn('h-5 w-5 shrink-0 text-[var(--color-text-muted)] transition-transform', isOpen && 'rotate-180')} />
            </button>
            <div className={cn('grid transition-all duration-200', isOpen ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden text-sm text-[var(--color-text-muted)]">{it.answer}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
