import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Drawer, Button, QuantityStepper, EmptyState, Price } from '../../../components/ui'
import { closeCartDrawer } from '../../ui'
import { useCart } from '../../../hooks'
import { formatPrice } from '../../../lib/format'
import { ShoppingBag } from 'lucide-react'

export function CartDrawer() {
  const open = useSelector((s) => s.ui.cartDrawerOpen)
  const dispatch = useDispatch()
  const { items, subtotal, totalItems, updateQuantity: upd, removeFromCart: rm } = useCart()
  return (
    <Drawer open={open} onClose={() => dispatch(closeCartDrawer())} side="right" title={`Cart (${totalItems})`}>
      {items.length === 0 ? (
        <div className="p-4">
          <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Browse the showroom and add something you love."
            action={<Button asChild onClick={() => dispatch(closeCartDrawer())}><Link to="/shop">Shop now</Link></Button>} />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-[var(--color-border)] px-4">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <img src={i.image} alt={i.name} className="h-16 w-16 rounded-md object-cover bg-[var(--color-surface-2)]" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${i.slug}`} onClick={() => dispatch(closeCartDrawer())} className="block truncate text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]">{i.name}</Link>
                  <p className="text-xs text-[var(--color-text-muted)] nums">{formatPrice(i.price)}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <QuantityStepper size="sm" value={i.quantity} min={1} max={i.stock || 99} onChange={(q) => upd(i.id, q)} />
                    <button onClick={() => rm(i.id)} className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-error)]">Remove</button>
                  </div>
                </div>
                <p className="font-display text-sm font-bold nums text-[var(--color-text)]">{formatPrice(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-[var(--color-border)] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Subtotal</span>
              <Price price={subtotal} size="md" showDiscount={false} />
            </div>
            <Button asChild className="w-full" onClick={() => dispatch(closeCartDrawer())}><Link to="/cart">View cart</Link></Button>
            <Button asChild variant="outline" className="mt-2 w-full" onClick={() => dispatch(closeCartDrawer())}><Link to="/checkout">Checkout</Link></Button>
          </div>
        </>
      )}
    </Drawer>
  )
}
