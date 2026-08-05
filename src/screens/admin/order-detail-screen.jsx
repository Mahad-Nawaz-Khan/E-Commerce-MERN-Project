import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, User, MapPin, CreditCard } from 'lucide-react'
import { Card, StatusBadge, Button, Spinner, Input } from '../../components/ui'
import { Timeline } from '../../components/ui/timeline'
import { useGetAdminOrderQuery, useUpdateOrderStatusMutation } from '../../features/admin/adminApiSlice'
import { formatPrice, formatDate } from '../../lib/format'

/** Admin order detail — items, customer, summary, status/tracking update form, timeline. */
export function OrderDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: res, isLoading, isError } = useGetAdminOrderQuery(id)

  const order = res?.data

  if (isLoading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-[var(--color-primary)]" /></div>
  if (isError || !order) {
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Order not found.</p>
          <Button asChild variant="secondary" className="mt-4"><Link to="/admin/orders">Back to orders</Link></Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate('/admin/orders')} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Order #{order.trackingNumber || order.id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={`Items (${order.items?.length || 0})`} bodyClassName="p-0">
            <ul className="divide-y divide-[var(--color-border)]">
              {order.items?.map((item, i) => (
                <li key={i} className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-2)]">
                    {item.product?.images?.[0] && <img src={imgUrl(item.product.images[0])} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Qty {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-display text-sm font-bold text-[var(--color-text)] nums">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end border-t border-[var(--color-border)] px-5 py-3">
              <span className="font-display text-lg font-black text-[var(--color-text)] nums">Total: {formatPrice(order.totalAmount)}</span>
            </div>
          </Card>

          <Card title="Status Timeline">
            <Timeline events={order.statusHistory} currentStatus={order.status} />
          </Card>
        </div>

        <div className="space-y-6">
          {/* Keyed child mounts fresh per order so useState initialises from order data. */}
          <StatusUpdateForm key={order.id} orderId={order.id} order={order} />

          {/* Customer */}
          <Card title="Customer">
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2 font-semibold text-[var(--color-text)]"><User className="h-4 w-4 text-[var(--color-text-muted)]" /> {order.user?.name || '—'}</p>
              <p className="text-[var(--color-text-muted)]">{order.user?.email}</p>
              {order.user?.id && <Link to={`/admin/customers/${order.user.id}`} className="text-xs font-medium text-[var(--color-primary)] hover:underline">View customer profile</Link>}
            </div>
          </Card>

          {/* Shipping */}
          <Card title="Shipping Address">
            <div className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <address className="not-italic leading-relaxed">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}<br />
                {order.shippingAddress.zip}, {order.shippingAddress.country}
              </address>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <CreditCard className="h-4 w-4" /> <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

function StatusUpdateForm({ orderId, order }) {
  const [updateStatus, { isLoading: saving }] = useUpdateOrderStatusMutation()
  const [form, setForm] = useState({
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber || '',
    estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.slice(0, 10) : '',
    note: '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function save(e) {
    e.preventDefault()
    try {
      await updateStatus({ id: orderId, ...form, estimatedDelivery: form.estimatedDelivery ? new Date(form.estimatedDelivery).toISOString() : undefined }).unwrap()
      toast.success('Order updated')
    } catch (err) {
      toast.error(err?.data?.error?.message || 'Could not update order')
    }
  }

  return (
    <Card title="Update Status">
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Order Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm capitalize text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]">
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Payment Status</label>
          <select value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)} className="h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm capitalize text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]">
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <Input label="Tracking Number" value={form.trackingNumber} onChange={(e) => set('trackingNumber', e.target.value)} placeholder="EX123456789" />
        <Input label="Estimated Delivery" type="date" value={form.estimatedDelivery} onChange={(e) => set('estimatedDelivery', e.target.value)} />
        <Input label="Internal Note" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Optional" />
        <Button type="submit" className="w-full" loading={saving}><Save className="h-4 w-4" /> Update Order</Button>
      </form>
    </Card>
  )
}

function imgUrl(p) {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('/uploads') || p.startsWith('/images')) return p
  return `/images/products/${p}`
}
