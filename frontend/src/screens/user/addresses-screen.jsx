import { useState } from 'react'
import toast from 'react-hot-toast'
import { MapPin, Plus, Pencil, Trash2, Star, Check } from 'lucide-react'
import { Card, Button, Input, Select, Dialog, EmptyState, Badge } from '../../components/ui'
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from '../../features/user/userApiSlice'

const empty = { label: 'Home', street: '', city: '', state: '', zip: '', country: 'Pakistan' }
const COUNTRIES = ['Pakistan', 'USA', 'UK', 'India', 'UAE', 'Germany', 'South Korea', 'Morocco']

/** Saved shipping addresses — full CRUD + set-default. */
export function AddressesScreen() {
  const { data: res, isLoading } = useGetAddressesQuery()
  const [addAddress, { isLoading: adding }] = useAddAddressMutation()
  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation()
  const [deleteAddress, { isLoading: deleting }] = useDeleteAddressMutation()
  const [setDefault, { isLoading: settingDefault }] = useSetDefaultAddressMutation()

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const addresses = res?.data?.addresses ?? []
  const defaultAddressId = res?.data?.defaultAddressId ?? null

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function openAdd() {
    setForm(empty)
    setEditingId(null)
    setOpen(true)
  }

  function openEdit(addr) {
    setForm({ label: addr.label || 'Home', street: addr.street, city: addr.city, state: addr.state || '', zip: addr.zip, country: addr.country })
    setEditingId(addr.id || addr._id)
    setOpen(true)
  }

  async function submit(e) {
    e.preventDefault()
    try {
      if (editingId) {
        await updateAddress({ addressId: editingId, ...form }).unwrap()
        toast.success('Address updated')
      } else {
        await addAddress(form).unwrap()
        toast.success('Address added')
      }
      setOpen(false)
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not save address')
    }
  }

  async function doDelete() {
    try {
      await deleteAddress(confirmDelete).unwrap()
      toast.success('Address removed')
      setConfirmDelete(null)
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not delete address')
    }
  }

  async function makeDefault(id) {
    try {
      await setDefault(id).unwrap()
      toast.success('Default address set')
    } catch {
      toast.error('Could not set default')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">My Addresses</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Manage saved shipping addresses.</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add New</Button>
      </header>

      {isLoading ? (
        <Card><p className="text-sm text-[var(--color-text-muted)]">Loading…</p></Card>
      ) : addresses.length === 0 ? (
        <Card><EmptyState icon={MapPin} title="No saved addresses" description="Add an address to speed up checkout." action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add address</Button>} /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => {
            const addressId = addr.id || addr._id
            const isDefault = String(addressId) === String(defaultAddressId)
            return (
              <Card key={addressId}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><MapPin className="h-4 w-4" /></span>
                    <span className="font-display text-sm font-bold text-[var(--color-text)]">{addr.label}</span>
                    {isDefault && <Badge tone="gold">Default</Badge>}
                  </div>
                </div>
                <address className="mt-3 not-italic text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {addr.street}<br />
                  {addr.city}{addr.state ? `, ${addr.state}` : ''}<br />
                  {addr.zip}, {addr.country}
                </address>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(addr)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  {!isDefault && <Button variant="ghost" size="sm" onClick={() => makeDefault(addressId)} loading={settingDefault}><Star className="h-3.5 w-3.5" /> Set default</Button>}
                  <Button variant="ghost" size="sm" className="text-[var(--color-sale)] hover:text-[var(--color-sale)]" onClick={() => setConfirmDelete(addressId)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / edit dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Address' : 'Add New Address'}>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Label" placeholder="Home, Office…" value={form.label} onChange={(e) => set('label', e.target.value)} />
          <Input label="Street address" required placeholder="House #, street, area" value={form.street} onChange={(e) => set('street', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" required value={form.city} onChange={(e) => set('city', e.target.value)} />
            <Input label="State / Province" value={form.state} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="ZIP / Postal" required value={form.zip} onChange={(e) => set('zip', e.target.value)} />
            <Select label="Country" value={form.country} onChange={(v) => set('country', v)} options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={adding || updating}><Check className="h-4 w-4" /> {editingId ? 'Save changes' : 'Add address'}</Button>
          </div>
        </form>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Address">
        <p className="text-sm text-[var(--color-text-muted)]">This address will be permanently removed. Continue?</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="sale" loading={deleting} onClick={doDelete}><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
      </Dialog>
    </div>
  )
}
