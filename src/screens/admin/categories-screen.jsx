import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Check, X, FolderTree } from 'lucide-react'
import { Card, Input, Textarea, Button, Dialog, EmptyState } from '../../components/ui'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../features/admin/adminApiSlice'

const empty = { name: '', description: '', image: '' }

/** Category CRUD — list with add/edit/delete. */
export function CategoriesScreen() {
  const { data: res, isLoading } = useGetCategoriesQuery()
  const [createCat, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCat, { isLoading: updating }] = useUpdateCategoryMutation()
  const [deleteCat, { isLoading: deleting }] = useDeleteCategoryMutation()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const categories = res?.data || []

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function openAdd() { setForm(empty); setEditingId(null); setOpen(true) }
  function openEdit(c) { setForm({ name: c.name, description: c.description || '', image: c.image || '' }); setEditingId(c.id); setOpen(true) }

  async function submit(e) {
    e.preventDefault()
    try {
      if (editingId) {
        await updateCat({ id: editingId, ...form }).unwrap()
        toast.success('Category updated')
      } else {
        await createCat(form).unwrap()
        toast.success('Category created')
      }
      setOpen(false)
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not save category')
    }
  }

  async function doDelete() {
    try {
      await deleteCat(confirmDelete).unwrap()
      toast.success('Category deleted')
      setConfirmDelete(null)
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not delete category')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Categories</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Organise your product catalog.</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Category</Button>
      </header>

      {isLoading ? (
        <Card><p className="text-sm text-[var(--color-text-muted)]">Loading…</p></Card>
      ) : categories.length === 0 ? (
        <Card><EmptyState icon={FolderTree} title="No categories" action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add category</Button>} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold text-[var(--color-text)]">{c.name}</h3>
                  <p className="mt-0.5 font-mono text-xs text-[var(--color-text-subtle)]">/{c.slug}</p>
                  {c.description && <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">{c.description}</p>}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                <Button variant="ghost" size="sm" className="text-[var(--color-sale)] hover:text-[var(--color-sale)]" onClick={() => setConfirmDelete(c.id)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Category' : 'New Category'}>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Name *" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Smartphones" />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
          <Input label="Image URL" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="/images/categories/phones.png" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={creating || updating}><Check className="h-4 w-4" /> {editingId ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Category">
        <p className="text-sm text-[var(--color-text-muted)]">Products in this category will remain but lose their category link. Continue?</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}><X className="h-4 w-4" /> Cancel</Button>
          <Button variant="sale" loading={deleting} onClick={doDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
      </Dialog>
    </div>
  )
}
