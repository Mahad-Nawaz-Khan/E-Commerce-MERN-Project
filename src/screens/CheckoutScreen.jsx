import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Button, Input, RadioGroup, Breadcrumb, EmptyState } from '../components/ui'
import { useCart } from '../hooks'
import { SHIPPING_FEE, FREE_SHIP_THRESHOLD } from '../lib/constants'
import { formatPrice } from '../lib/format'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'

const empty = { name: '', email: '', address: '', city: '', zip: '', country: '' }

/** Checkout route — validated shipping form + payment choice + order confirmation. */
function CheckoutScreen() {
  const { items, subtotal, clear } = useCart()
  const [form, setForm] = useState(empty)
  const [payment, setPayment] = useState('card')
  const [errors, setErrors] = useState({})
  const [placed, setPlaced] = useState(null) // { id, total, email }

  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  if (items.length === 0 && !placed) {
    return <Container className="py-16"><EmptyState icon={ShoppingBag} title="Nothing to check out" description="Your cart is empty." action={<Button asChild><Link to="/shop">Shop now</Link></Button>} /></Container>
  }
  if (placed) {
    return (
      <Container className="py-16 text-center">
        <p className="font-display text-5xl font-black text-[var(--color-primary)]">✓</p>
        <h1 className="mt-4 font-display text-3xl font-black text-[var(--color-text)]">Order confirmed</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Order <span className="nums text-[var(--color-text)]">{placed.id}</span> — {formatPrice(placed.total)}. A confirmation is on its way to {placed.email}.</p>
        <Button asChild className="mt-6"><Link to="/shop">Continue shopping</Link></Button>
      </Container>
    )
  }
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }
  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.zip.trim()) e.zip = 'Required'
    if (!form.country.trim()) e.country = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function placeOrder(e) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }
    const id = 'EX-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    setPlaced({ id, total, email: form.email })
    clear()
    toast.success('Order placed!')
  }

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} className="mb-4" />
      <h1 className="mb-6 font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="surface-paper space-y-4 rounded-lg p-6">
          <h2 className="font-display text-lg font-bold text-[var(--color-content-inv)]">Shipping details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} className="sm:col-span-2" />
            <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
            <Input label="ZIP / Postal" value={form.zip} onChange={(e) => set('zip', e.target.value)} error={errors.zip} />
            <Input label="Country" value={form.country} onChange={(e) => set('country', e.target.value)} error={errors.country} className="sm:col-span-2" />
          </div>
          <div className="pt-2"><RadioGroup label="Payment" value={payment} onChange={setPayment} options={[{ value: 'card', label: 'Credit / Debit card' }, { value: 'cod', label: 'Cash on delivery' }]} /></div>
        </div>
        <aside className="h-fit space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Your order</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between"><span className="text-[var(--color-text-muted)]">{i.name} × {i.quantity}</span><span className="nums">{formatPrice(i.price * i.quantity)}</span></li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-[var(--color-border)] pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Subtotal</dt><dd className="nums">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Shipping</dt><dd className="nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between font-display text-base font-bold"><dt>Total</dt><dd className="nums">{formatPrice(total)}</dd></div>
          </dl>
          <Button type="submit" variant="sale" className="w-full">Place order</Button>
        </aside>
      </form>
    </Container>
  )
}

export { CheckoutScreen }
