import { useSearchParams } from 'react-router-dom'
import { Container, Breadcrumb, Select, Switch, Pagination, EmptyState, ProductGrid } from '../components/ui'
import { getProductSummaries } from '../data/products'
import { categories } from '../data/categories'
import { applyShopQuery } from '../features/shop'
import { PER_PAGE } from '../lib/constants'
import { Search } from 'lucide-react'

const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
]

/** Shop route — filters/sort/pagination/search, all URL-synced via useSearchParams. */
function ShopScreen() {
  const [params, setParams] = useSearchParams()
  const q = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || '',
    page: Number(params.get('page')) || 1,
    perPage: PER_PAGE,
    minPrice: Number(params.get('minPrice')) || 0,
    maxPrice: Number(params.get('maxPrice')) || Infinity,
    minRating: Number(params.get('minRating')) || 0,
    inStockOnly: params.get('inStock') === '1',
  }
  const { items, pagination } = applyShopQuery(getProductSummaries(), q)
  function set(key, val) {
    const next = new URLSearchParams(params)
    if (val === '' || val == null) next.delete(key)
    else next.set(key, val)
    if (key !== 'page') next.delete('page') // reset page on filter change
    setParams(next)
  }
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} className="mb-4" />
      <h1 className="font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Shop the showroom</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{pagination.total} product{pagination.total !== 1 ? 's' : ''}{q.search ? ` matching “${q.search}”` : ''}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Category</h2>
            <ul className="space-y-1">
              <li><button onClick={() => set('category', '')} className={`text-sm ${!q.category ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>All</button></li>
              {categories.map((c) => (
                <li key={c.slug}><button onClick={() => set('category', c.name)} className={`text-sm ${q.category === c.name ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>{c.name}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Price</h2>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" defaultValue={q.minPrice || ''} onBlur={(e) => set('minPrice', e.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 text-sm text-[var(--color-text)]" />
              <input type="number" placeholder="Max" defaultValue={q.maxPrice === Infinity ? '' : q.maxPrice} onBlur={(e) => set('maxPrice', e.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 text-sm text-[var(--color-text)]" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Rating</h2>
            <Select value={String(q.minRating)} onChange={(v) => set('minRating', v)} options={[{ value: '0', label: 'Any' }, { value: '4', label: '4.0 +' }, { value: '4.5', label: '4.5 +' }]} />
          </div>
          <Switch checked={q.inStockOnly} onChange={(c) => set('inStock', c ? '1' : '')} label="In stock only" />
        </aside>
        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">Page {pagination.page} of {pagination.pageCount}</p>
            <div className="w-48"><Select value={q.sort} onChange={(v) => set('sort', v)} options={SORTS} /></div>
          </div>
          {items.length === 0 ? (
            <EmptyState icon={Search} title="No products match" description="Try widening your filters or clearing the search." />
          ) : (
            <>
              <ProductGrid products={items} columns={3} />
              <Pagination className="mt-8" page={pagination.page} pageCount={pagination.pageCount} onChange={(p) => set('page', String(p))} />
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

export { ShopScreen }
