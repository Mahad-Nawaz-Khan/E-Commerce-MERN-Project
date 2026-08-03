import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Button, QuantityStepper, EmptyState, Input, Breadcrumb } from '../components/ui'
import { useCart } from '../hooks'
import { validateCoupon } from '../data/coupons'
import { formatPrice } from '../lib/format'
import { SHIPPING_FEE, FREE_SHIP_THRESHOLD } from '../lib/constants'
import { ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

/** Cart route — line items with qty steppers, coupon validation, and live totals. */
function CartScreen() {
  const { items, subtotal, totalItems, updateQuantity, removeFromCart } = useCart()
  const [code, setCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const discount = coupon?.discount || 0
  const freeShip = coupon?.freeShipping || subtotal >= FREE_SHIP_THRESHOLD
  const shipping = items.length === 0 || freeShip ? 0 : SHIPPING_FEE
  const total = Math.max(0, subtotal - discount) + shipping

  function applyCoupon(e) {
    e.preventDefault()
    const r = validateCoupon(code, subtotal)
    if (r.valid) { setCoupon(r); toast.success(r.message) }
    else { setCoupon(null); toast.error(r.message) }
  }

  if (items.length === 0) {
    return <Container className="py-16"><EmptyState icon={ShoppingBag} title="Your cart is empty" description="Browse the showroom and add something you love." action={<Button asChild><Link to="/shop">Shop now</Link></Button>} /></Container>
  }
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} className="mb-4" />
      <h1 className="mb-6 font-display text-3xl font-black tracking-tight text-[var(--color-text)]">Cart ({totalItems})</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4 p-4">
              <Link to={`/product/${i.slug}`}><img src={i.image} alt={i.name} className="h-20 w-20 rounded-md bg-[var(--color-surface-2)] object-cover" /></Link>
              <div className="flex flex-1 flex-col">
                <Link to={`/product/${i.slug}`} className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]">{i.name}</Link>
                <span className="text-xs text-[var(--color-text-subtle)] nums">{formatPrice(i.price)}</span>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <QuantityStepper size="sm" value={i.quantity} min={1} max={i.stock || 99} onChange={(q) => updateQuantity(i.id, q)} />
                  <button onClick={() => removeFromCart(i.id)} className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-error)]">Remove</button>
                </div>
              </div>
              <p className="font-display font-bold nums text-[var(--color-text)]">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <aside className="h-fit space-y-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-display text-lg font-bold text-[var(--color-text)]">Order summary</h2>
          <form onSubmit={applyCoupon} className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="h-10" />
            <Button type="submit" variant="outline" className="shrink-0">Apply</Button>
          </form>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Subtotal</dt><dd className="nums">{formatPrice(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-[var(--color-success)]"><dt>Discount</dt><dd className="nums">-{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Shipping</dt><dd className="nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-display text-base font-bold"><dt>Total</dt><dd className="nums">{formatPrice(total)}</dd></div>
          </dl>
          <Button asChild className="w-full"><Link to="/checkout">Proceed to checkout</Link></Button>
        </aside>
      </div>
    </Container>
  )
}

export { CartScreen }
