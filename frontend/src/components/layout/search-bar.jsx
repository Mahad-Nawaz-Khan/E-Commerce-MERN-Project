import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'

export function SearchBar() {
  const [term, setTerm] = useState('')
  const debounced = useDebounce(term, 300)
  const navigate = useNavigate()
  function submit(e) {
    e.preventDefault()
    navigate(`/shop?search=${encodeURIComponent(debounced.trim())}`)
  }
  return (
    <form onSubmit={submit} role="search" className="relative flex-1 max-w-md">
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
      />
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
    </form>
  )
}
