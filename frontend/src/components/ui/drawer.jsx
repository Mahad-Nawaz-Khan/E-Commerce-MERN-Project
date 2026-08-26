import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Drawer({ open, onClose, side = 'right', title, children }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  return (
    <div className={cn('fixed inset-0 z-[100]', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
      <div className={cn('absolute inset-0 bg-black/60 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title}
        className={cn('absolute top-0 flex h-full w-full max-w-sm flex-col border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)] transition-transform duration-300',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full')}>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
          <h2 className="font-display text-base font-bold text-[var(--color-text)]">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
