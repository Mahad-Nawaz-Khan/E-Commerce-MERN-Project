import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, Printer, XCircle, MapPin, CreditCard } from 'lucide-react'
import { Card, StatusBadge, Button, Spinner, OrderFlowSteps } from '../../components/ui'
import { Timeline } from '../../components/ui/timeline'
import { useGetOrderQuery, useCancelOrderMutation } from '../../features/user/userApiSlice'
import { formatPrice, formatDate } from '../../lib/format'

/** Single order view: items, summary, shipping, tracking timeline, cancel, print. */
export function OrderDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: res, isLoading, isError } = useGetOrderQuery(id)
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()
  const [confirming, setConfirming] = useState(false)

  const order = res?.data

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-[var(--color-primary)]" /></div>
  }
  if (isError || !order) {
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Order not found.</p>
          <Button asChild variant="secondary" className="mt-4"><Link to="/account/orders">Back to orders</Link></Button>
        </div>
      </Card>
    )
  }

  const cancellable = ['pending', 'processing'].includes(order.status)

  const doCancel = async () => {
    try {
      await cancelOrder(order.id).unwrap()
      toast.success('Order cancelled.')
      setConfirming(false)
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not cancel order')
    }
  }

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate('/account/orders')} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">
            Order #{order.orderNumber || order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Invoice</Button>
          {cancellable && !confirming && (
            <Button variant="sale" size="sm" onClick={() => setConfirming(true)}><XCircle className="h-4 w-4" /> Cancel</Button>
          )}
        </div>
      </div>

      {confirming && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--color-text)]">Are you sure you want to cancel this order? Stock will be returned.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Keep order</Button>
              <Button variant="sale" size="sm" loading={cancelling} onClick={doCancel}>Yes, cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Flow steps (when not cancelled) */}
      {order.status !== 'cancelled' && (
        <Card><OrderFlowSteps status={order.status} /></Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card title={`Items (${order.items?.length || 0})`} bodyClassName="p-0">
            <ul className="divide-y divide-[var(--color-border)]">
              {order.items?.map((item, i) => {
                const product = item.product
                return (
                  <li key={i} className="flex items-center gap-4 p-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-2)]">
                      {product?.images?.[0] ? (
                        <img src={imgUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">{product?.name || 'Product'}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Qty {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    {product?.slug && (
                      <Link to={`/product/${product.slug}`} className="text-xs font-medium text-[var(--color-primary)] hover:underline">View</Link>
                    )}
                    <span className="w-20 text-right font-display text-sm font-bold text-[var(--color-text)] nums">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Tracking timeline */}
          <Card title="Order Tracking">
            <Timeline events={order.statusHistory} currentStatus={order.status} />
            {order.estimatedDelivery && order.status !== 'cancelled' && (
              <p className="mt-4 rounded-md bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                Estimated delivery: <span className="font-medium text-[var(--color-text)]">{formatDate(order.estimatedDelivery)}</span>
              </p>
            )}
          </Card>
        </div>

        {/* Sidebar: summary + shipping */}
        <div className="space-y-6">
          <Card title="Order Summary">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Subtotal</dt><dd className="nums text-[var(--color-text)]">{formatPrice(order.totalAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--color-text-muted)]">Shipping</dt><dd className="text-[var(--color-success)]">Free</dd></div>
              <div className="mt-2 flex justify-between border-t border-[var(--color-border)] pt-2"><dt className="font-semibold text-[var(--color-text)]">Total</dt><dd className="font-display text-lg font-black text-[var(--color-text)] nums">{formatPrice(order.totalAmount)}</dd></div>
            </dl>
          </Card>

          <Card title="Payment">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <CreditCard className="h-4 w-4" />
              <span className="capitalize">{order.paymentMethod}</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </Card>

          <Card title="Shipping Address">
            <div className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <address className="not-italic leading-relaxed">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}<br />
                {order.shippingAddress.zip}, {order.shippingAddress.country}
              </address>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function imgUrl(p) {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('/uploads') || p.startsWith('/images')) return p
  return `/images/products/${p}`
}
