import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
export function Tooltip({ label, children, className }) {
  const [show, setShow] = useState(false)
  const id = useId()
  return (
    <span className={cn('relative inline-flex', className)}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      <span aria-describedby={show ? id : undefined}>{children}</span>
      {show && (
        <span role="tooltip" id={id} className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-content-inv)] px-2 py-1 text-xs text-[var(--color-paper)] shadow-[var(--shadow-pop)]">
          {label}
        </span>
      )}
    </span>
  )
}
