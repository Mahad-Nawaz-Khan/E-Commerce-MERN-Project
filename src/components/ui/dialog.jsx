import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Dialog({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-lg rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-pop)]', className)}>
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[var(--color-text)]">{title}</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X className="h-5 w-5" /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
