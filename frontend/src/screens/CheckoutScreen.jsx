import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Button, Input, RadioGroup, Breadcrumb, EmptyState } from '../components/ui'
import { useCart } from '../hooks'
import { useAuth } from '../hooks/useAuth'
import { useCreateOrderMutation } from '../features/shop/shopApiSlice'
import { SHIPPING_FEE, FREE_SHIP_THRESHOLD } from '../lib/constants'
import { formatPrice } from '../lib/format'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'

const empty = { name: '', email: '', address: '', city: '', state: '', zip: '', country: '' }

/** Checkout route — validated shipping form + payment choice + live order creation. */
function CheckoutScreen() {
  const { items, subtotal, clear } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [createOrder, { isLoading: placing }] = useCreateOrderMutation()
  const [form, setForm] = useState(empty)
  const [payment, setPayment] = useState('cod')
  const [errors, setErrors] = useState({})
  const [placed, setPlaced] = useState(null) // { orderNumber, total, email }

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
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Order <span className="nums text-[var(--color-text)]">{placed.orderNumber}</span> — {formatPrice(placed.total)}. A confirmation is on its way to {placed.email}.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="secondary"><Link to={`/account/orders/${placed.orderNumber}`}>Track order</Link></Button>
          <Button asChild><Link to="/shop">Continue shopping</Link></Button>
        </div>
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
  async function placeOrder(e) {
    e.preventDefault()
    // Orders require authentication — the backend stamps req.user on the order.
    if (!isAuthenticated) {
      toast.error('Please sign in to place your order.')
      navigate('/login?redirect=/checkout')
      return
    }
    if (!validate()) { toast.error('Please fix the highlighted fields.'); return }

    const payload = {
      // The storefront still uses static product IDs. Send the stable slug too so
      // the API can resolve the corresponding seeded/catalog product safely.
      items: items.map((i) => ({ product: /^[a-f\d]{24}$/i.test(i.id) ? i.id : undefined, productSlug: i.slug, quantity: i.quantity })),
      shippingAddress: {
        street: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        country: form.country.trim(),
      },
      paymentMethod: payment,
    }

    try {
      const res = await createOrder(payload).unwrap()
      const order = res.data
      setPlaced({ orderNumber: order.orderNumber || `EX-${order.id.slice(-8).toUpperCase()}`, total: order.totalAmount, email: form.email })
      clear()
      toast.success('Order placed!')
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not place order')
    }
  }

  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} className="mb-4" />
      <h1 className="mb-6 font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Checkout</h1>
      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Shipping details</h2>
          {isAuthenticated && user && (
            <p className="rounded-md bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
              Signed in as <span className="font-medium text-[var(--color-text)]">{user.email}</span>
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} className="sm:col-span-2" />
            <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
            <Input label="State / Province" value={form.state} onChange={(e) => set('state', e.target.value)} />
            <Input label="ZIP / Postal" value={form.zip} onChange={(e) => set('zip', e.target.value)} error={errors.zip} />
            <Input label="Country" value={form.country} onChange={(e) => set('country', e.target.value)} error={errors.country} />
          </div>
          <div className="pt-2"><RadioGroup label="Payment" value={payment} onChange={setPayment} options={[{ value: 'card', label: 'Credit / Debit card' }, { value: 'cod', label: 'Cash on delivery' }, { value: 'safepay', label: 'SafePay' }]} /></div>
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
          <Button type="submit" variant="sale" className="w-full" loading={placing}>Place order</Button>
          {!isAuthenticated && (
            <p className="text-center text-xs text-[var(--color-text-subtle)]">You&apos;ll need to <Link to="/login?redirect=/checkout" className="text-[var(--color-primary)] hover:underline">sign in</Link> to complete checkout.</p>
          )}
        </aside>
      </form>
    </Container>
  )
}

export { CheckoutScreen }
