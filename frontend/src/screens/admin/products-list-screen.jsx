import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, Check, X } from 'lucide-react'
import { Card, Input, Select, Textarea, Button, DataTable, StatusBadge, Dialog, Switch } from '../../components/ui'
import { ImageUploader } from '../../components/admin/image-uploader'
import {
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
} from '../../features/admin/adminApiSlice'
import { useDebounce } from '../../hooks'
import { formatPrice, formatNumber } from '../../lib/format'

const PAGE_SIZE = 20
const emptyForm = {
  name: '', description: '', price: '', originalPrice: '', category: '',
  brand: '', sku: '', stock: '0', images: [], sizes: '', tags: '', colors: '', isActive: true,
}

/** Products management — list (filter/search/paginate), create/edit, delete, bulk ops. */
export function ProductsListScreen() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [category, setCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [selected, setSelected] = useState([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: catRes } = useGetCategoriesQuery()
  const categoryOptions = (catRes?.data || []).map((c) => ({ value: c.id, label: c.name }))

  const { data, isLoading } = useGetAdminProductsQuery({
    page, limit: PAGE_SIZE, search: debouncedSearch,
    category: category || undefined, stockFilter: stockFilter !== 'all' ? stockFilter : undefined,
  })
  const products = data?.data || []
  const pagination = data?.pagination

  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation()
  const [bulkUpdate] = useBulkUpdateProductsMutation()
  const [bulkDelete] = useBulkDeleteProductsMutation()

  function openAdd() {
    setForm({ ...emptyForm, category: categoryOptions[0]?.value || '' })
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(p) {
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: String(p.price ?? ''),
      originalPrice: String(p.originalPrice ?? ''),
      category: p.category?._id || p.category || '',
      brand: p.brand || '',
      sku: p.sku || '',
      stock: String(p.stock ?? '0'),
      images: p.images || [],
      sizes: (p.sizes || []).join(', '),
      tags: (p.tags || []).join(', '),
      colors: (p.colors || []).map((c) => `${c.name}:${c.value}`).join(', '),
      isActive: p.isActive !== false,
    })
    setEditing(p)
    setFormOpen(true)
  }

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      category: form.category,
      brand: form.brand.trim(),
      sku: form.sku.trim() || undefined,
      stock: Number(form.stock) || 0,
      images: form.images,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean).map((pair) => {
        const [name, value] = pair.split(':')
        return { name: (name || '').trim(), value: (value || '').trim() }
      }).filter((c) => c.name && c.value),
      isActive: form.isActive,
    }
    try {
      if (editing) {
        await updateProduct({ id: editing.id, ...payload }).unwrap()
        toast.success('Product updated')
      } else {
        await createProduct(payload).unwrap()
        toast.success('Product created')
      }
      setFormOpen(false)
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not save product')
    }
  }

  async function doDelete() {
    try {
      await deleteProduct(confirmDelete).unwrap()
      toast.success('Product deleted')
      setConfirmDelete(null)
    } catch {
      toast.error('Could not delete product')
    }
  }

  async function bulkActivate(active) {
    if (!selected.length) return
    try {
      await bulkUpdate({ ids: selected, updates: { isActive: active } }).unwrap()
      toast.success(`${selected.length} product(s) ${active ? 'activated' : 'deactivated'}`)
      setSelected([])
    } catch {
      toast.error('Bulk update failed')
    }
  }

  async function bulkRemove() {
    if (!selected.length) return
    try {
      await bulkDelete({ ids: selected, hard: false }).unwrap()
      toast.success(`${selected.length} product(s) removed`)
      setSelected([])
    } catch {
      toast.error('Bulk delete failed')
    }
  }

  const columns = [
    {
      key: 'name', header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-2)]">
            {p.images?.[0] && <img src={imgUrl(p.images[0])} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{p.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{p.brand || '—'} {p.sku ? `· ${p.sku}` : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category', header: 'Category', hideOnMobile: true,
      cell: (p) => <span className="text-[var(--color-text-muted)]">{p.category?.name || '—'}</span>,
    },
    {
      key: 'price', header: 'Price', align: 'right',
      cell: (p) => <span className="font-display font-bold text-[var(--color-text)] nums">{formatPrice(p.price)}</span>,
    },
    {
      key: 'stock', header: 'Stock', align: 'right',
      cell: (p) => (
        <span className={'nums ' + (p.stock === 0 ? 'text-[var(--color-sale)] font-bold' : p.stock <= 10 ? 'text-[var(--color-warning)] font-bold' : 'text-[var(--color-text)]')}>
          {formatNumber(p.stock)}
        </span>
      ),
    },
    {
      key: 'isActive', header: 'Status',
      cell: (p) => <StatusBadge variant={p.isActive !== false ? 'success' : 'neutral'}>{p.isActive !== false ? 'Active' : 'Inactive'}</StatusBadge>,
    },
    {
      key: 'actions', header: '', align: 'right',
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" aria-label="Delete" className="text-[var(--color-sale)] hover:text-[var(--color-sale)]" onClick={() => setConfirmDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Products</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Create, edit, and manage your catalog.</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Product</Button>
      </header>

      <Card>
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-subtle)]" />
            <Input className="pl-9" placeholder="Search name, SKU, brand" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <Select value={category} onChange={(v) => { setCategory(v); setPage(1) }} options={[{ value: '', label: 'All categories' }, ...categoryOptions]} />
          <Select value={stockFilter} onChange={(v) => { setStockFilter(v); setPage(1) }} options={[
            { value: 'all', label: 'All stock' },
            { value: 'instock', label: 'In stock' },
            { value: 'low', label: 'Low stock (≤10)' },
            { value: 'out', label: 'Out of stock' },
          ]} />
        </div>

        {selected.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md bg-[var(--color-primary)]/10 px-4 py-2.5">
            <span className="text-sm font-medium text-[var(--color-text)]">{selected.length} selected</span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => bulkActivate(true)}>Activate</Button>
              <Button size="sm" variant="outline" onClick={() => bulkActivate(false)}>Deactivate</Button>
              <Button size="sm" variant="sale" onClick={bulkRemove}><Trash2 className="h-3.5 w-3.5" /> Remove</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          rows={products}
          rowKey="id"
          loading={isLoading}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          pagination={pagination ? { page: pagination.page, pageCount: pagination.pages, onPageChange: setPage } : undefined}
          empty={{ title: 'No products', description: 'Add your first product to get started.' }}
        />
      </Card>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Product' : 'New Product'} className="max-w-2xl">
        <form onSubmit={submit} className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <Input label="Name *" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price *" type="number" step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} />
            <Input label="Original Price" type="number" step="0.01" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category *" required value={form.category} onChange={(v) => set('category', v)} options={categoryOptions} placeholder="Select category" />
            <Input label="Stock" type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            <Input label="SKU" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
          </div>
          <ImageUploader label="Product images" urls={form.images} onChange={(urls) => set('images', urls)} />
          <Input label="Sizes (comma-separated)" value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="S, M, L, XL" />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="featured, bestseller" />
          <Input label="Colors (name:hex, comma-separated)" value={form.colors} onChange={(e) => set('colors', e.target.value)} placeholder="Black:#171717, Silver:#C0C0C0" />
          <div className="flex items-center justify-between rounded-md bg-[var(--color-surface-2)] px-3 py-2.5">
            <span className="text-sm font-medium text-[var(--color-text)]">Active (visible in store)</span>
            <Switch checked={form.isActive} onChange={(v) => set('isActive', v)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={creating || updating}><Check className="h-4 w-4" /> {editing ? 'Save changes' : 'Create product'}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Product">
        <p className="text-sm text-[var(--color-text-muted)]">This permanently removes the product. Continue?</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}><X className="h-4 w-4" /> Cancel</Button>
          <Button variant="sale" loading={deleting} onClick={doDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
      </Dialog>
    </div>
  )
}

function imgUrl(p) {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('/uploads') || p.startsWith('/images')) return p
  return `/images/products/${p}`
}
