import { useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2, MessageSquare } from 'lucide-react'
import { Card, Button, Rating, Dialog, Pagination, EmptyState } from '../../components/ui'
import { useGetAdminReviewsQuery, useDeleteReviewMutation } from '../../features/admin/adminApiSlice'
import { formatDate } from '../../lib/format'

const PAGE_SIZE = 25
const RATINGS = ['all', '5', '4', '3', '2', '1']

/** Reviews moderation — list, filter by rating, delete (rating auto-recalculates server-side). */
export function ReviewsScreen() {
  const [page, setPage] = useState(1)
  const [rating, setRating] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useGetAdminReviewsQuery({ page, limit: PAGE_SIZE, rating: rating !== 'all' ? rating : undefined })
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation()

  const reviews = data?.data || []
  const pagination = data?.pagination

  async function doDelete() {
    try {
      await deleteReview(confirmDelete).unwrap()
      toast.success('Review deleted')
      setConfirmDelete(null)
    } catch {
      toast.error('Could not delete review')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-black text-[var(--color-text)]">Reviews</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Moderate customer reviews across all products.</p>
      </header>

      <Card>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {RATINGS.map((r) => (
            <button key={r} type="button" onClick={() => { setRating(r); setPage(1) }}
              className={'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ' +
                (rating === r ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}>
              {r === 'all' ? 'All' : `${r}★`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="p-5 text-sm text-[var(--color-text-muted)]">Loading…</p>
        ) : reviews.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No reviews" description="Customer reviews will appear here." />
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {reviews.map((rev) => (
              <li key={rev.id} className="flex gap-4 p-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-2)]">
                  {rev.product?.images?.[0] && <img src={imgUrl(rev.product.images[0])} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{rev.product?.name || 'Product'}</span>
                    <Rating value={rev.rating} size={14} />
                  </div>
                  {rev.title && <p className="mt-1 text-sm font-medium text-[var(--color-text)]">{rev.title}</p>}
                  {rev.body && <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{rev.body}</p>}
                  <p className="mt-1 text-xs text-[var(--color-text-subtle)]">By {rev.user?.name || 'Anonymous'} · {formatDate(rev.createdAt)}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Delete review" className="text-[var(--color-sale)] hover:text-[var(--color-sale)]" onClick={() => setConfirmDelete(rev.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="border-t border-[var(--color-border)] px-4 py-3">
            <Pagination page={pagination.page} pageCount={pagination.pages} onChange={setPage} />
          </div>
        )}
      </Card>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Review">
        <p className="text-sm text-[var(--color-text-muted)]">This review will be permanently removed and the product rating recalculated.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
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
