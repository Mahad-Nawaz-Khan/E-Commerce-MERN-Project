import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ImagePlus, X } from 'lucide-react'
import { Input, Button, Spinner } from '../ui'
import { cn } from '../../lib/cn'
import { useUploadMultipleMediaMutation } from '../../features/admin/adminApiSlice'

/**
 * Drag-and-drop image uploader for admin forms. Files POST to
 * /api/media/multiple (Cloudinary-backed) and the returned URLs join the
 * form's image list; external URLs can still be added by hand. `single`
 * restricts the list to one image (e.g. a category thumbnail).
 */
export function ImageUploader({ label = 'Images', urls = [], onChange, single = false, className }) {
  const inputRef = useRef(null)
  const [manual, setManual] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadMultiple, { isLoading }] = useUploadMultipleMediaMutation()

  async function upload(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (files.length === 0) return
    try {
      const res = await uploadMultiple(files).unwrap()
      const added = (Array.isArray(res.data) ? res.data : [res.data]).map((m) => m.url).filter(Boolean)
      onChange(single ? added.slice(0, 1) : [...urls, ...added])
      toast.success(`Uploaded ${added.length} image${added.length !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Upload failed — is Cloudinary configured?')
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  function addManual(e) {
    e.preventDefault()
    const url = manual.trim()
    if (!url) return
    onChange(single ? [url] : [...urls, url])
    setManual('')
  }

  function remove(url) {
    onChange(single ? [] : urls.filter((u) => u !== url))
  }

  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">{label}</label>}
      {urls.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {urls.map((url) => (
            <li key={url} className="group relative h-16 w-16 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => remove(url)} aria-label="Remove image"
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-bg)]/80 text-[var(--color-text-muted)] opacity-0 transition-opacity hover:text-[var(--color-error)] group-hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files) }}
        className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-3 text-xs transition-colors',
          dragOver
            ? 'border-[var(--color-primary)] bg-[var(--color-surface-2)] text-[var(--color-text)]'
            : 'border-[var(--color-border-strong)] text-[var(--color-text-subtle)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)]')}
      >
        {isLoading
          ? <><Spinner className="h-4 w-4" /> Uploading…</>
          : <><ImagePlus className="h-4 w-4" /> {single ? 'Drop an image here or click to upload' : 'Drop images here or click to upload'}</>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple={!single} className="hidden" onChange={(e) => upload(e.target.files)} />
      {!single && (
        <form onSubmit={addManual} className="mt-2 flex items-end gap-2">
          <Input label="Or paste an image URL" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="https://…" className="flex-1" />
          <Button type="submit" variant="outline">Add</Button>
        </form>
      )}
    </div>
  )
}
