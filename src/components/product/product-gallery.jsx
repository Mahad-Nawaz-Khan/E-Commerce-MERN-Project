import { useState } from 'react'
import { cn } from '../../lib/cn'

export function ProductGallery({ images = [], alt }) {
  const [active, setActive] = useState(0)
  const safe = images.length ? images : ['/images/products/monitor.png']
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <img src={safe[active]} alt={alt} className="h-full w-full object-cover" />
      </div>
      {safe.length > 1 && (
        <div className="flex gap-2">
          {safe.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
              className={cn('h-16 w-16 overflow-hidden rounded-md border-2 bg-[var(--color-surface-2)]', i === active ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]')}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
