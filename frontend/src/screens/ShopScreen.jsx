import { useSearchParams } from 'react-router-dom'
import { Container, Breadcrumb, Select, Switch, Pagination, EmptyState } from '../components/ui'
import { ProductGrid } from '../components/product/product-grid'
import { useGetProductsQuery, useGetCategoryTreeQuery } from '../features/shop/shopApiSlice'
import { normalizeProduct } from '../lib/product'
import { PER_PAGE } from '../lib/constants'
import { Search } from 'lucide-react'

const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
]

/**
 * Shop route — filters/sort/pagination/search executed server-side via
 * GET /products, all URL-synced through useSearchParams.
 */
function ShopScreen() {
  const [params, setParams] = useSearchParams()
  const q = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || '',
    page: Number(params.get('page')) || 1,
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    minRating: params.get('minRating') || '',
    inStockOnly: params.get('inStock') === '1',
  }

  // Bracketed params (price[gte]) hit the backend's extended query parser.
  const apiParams = { page: q.page, limit: PER_PAGE }
  if (q.search) apiParams.search = q.search
  if (q.category) apiParams.category = q.category // backend resolves slug or name
  if (q.sort) apiParams.sort = q.sort
  if (q.minPrice) apiParams['price[gte]'] = q.minPrice
  if (q.maxPrice) apiParams['price[lte]'] = q.maxPrice
  if (q.minRating) apiParams['ratingAvg[gte]'] = q.minRating
  if (q.inStockOnly) apiParams['stock[gte]'] = 1

  const { data, isLoading, isFetching } = useGetProductsQuery(apiParams)
  const { data: categoryTree } = useGetCategoryTreeQuery()
  const categories = categoryTree?.data || []

  const items = (data?.data || []).map(normalizeProduct)
  const pagination = data?.pagination || { page: 1, total: 0, pages: 1 }

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
                <li key={c.slug}>
                  <button onClick={() => set('category', c.name)} className={`text-sm ${q.category === c.name ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>{c.name}</button>
                  <ul className="ml-3 mt-1 space-y-1 border-l border-[var(--color-border)] pl-3">
                    {(c.children || []).map((child) => (
                      <li key={child.slug}>
                        <button onClick={() => set('category', child.name)} className={`text-[13px] ${q.category === child.name ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text)]'}`}>{child.name}</button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Price</h2>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" defaultValue={q.minPrice} onBlur={(e) => set('minPrice', e.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 text-sm text-[var(--color-text)]" />
              <input type="number" placeholder="Max" defaultValue={q.maxPrice} onBlur={(e) => set('maxPrice', e.target.value)} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 text-sm text-[var(--color-text)]" />
            </div>
          </div>
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-[var(--color-text)]">Rating</h2>
            <Select value={String(q.minRating)} onChange={(v) => set('minRating', v)} options={[{ value: '', label: 'Any' }, { value: '4', label: '4.0 +' }, { value: '4.5', label: '4.5 +' }]} />
          </div>
          <Switch checked={q.inStockOnly} onChange={(c) => set('inStock', c ? '1' : '')} label="In stock only" />
        </aside>
        {/* Results */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-muted)]">Page {pagination.page} of {pagination.pages}</p>
            <div className="w-48"><Select value={q.sort} onChange={(v) => set('sort', v)} options={SORTS} /></div>
          </div>
          {!isLoading && items.length === 0 ? (
            <EmptyState icon={Search} title="No products match" description="Try widening your filters or clearing the search." />
          ) : (
            <>
              <ProductGrid products={items} loading={isLoading} columns={3} className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : undefined} />
              <Pagination className="mt-8" page={pagination.page} pageCount={pagination.pages} onChange={(p) => set('page', String(p))} />
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

export { ShopScreen }
