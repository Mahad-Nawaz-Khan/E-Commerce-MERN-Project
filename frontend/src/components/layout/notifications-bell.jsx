import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { apiSlice } from '../../features/api/apiSlice'
import { socket } from '../../lib/socket'
import { Skeleton } from '../ui/skeleton'
import { formatRelativeTime } from '../../lib/format'
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from '../../features/user/userApiSlice'

/**
 * Navbar notification bell. Real-time push over Socket.IO — the server emits
 * `notification:new` the moment a notification is created, which invalidates
 * the notification cache (badge + open panel refresh instantly). No polling.
 * The count query still runs once on login for the initial badge.
 */
export function NotificationsBell() {
  const { isAuthenticated, token } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { data: countData } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
  })
  const unread = countData?.data?.count || 0

  const { data: listData, isLoading } = useGetNotificationsQuery(
    { limit: 10 },
    { skip: !isAuthenticated || !open },
  )
  const notifications = listData?.data || []

  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllNotificationsReadMutation()
  const [deleteOne] = useDeleteNotificationMutation()

  // Keep the latest token reachable from the reconnect handler without
  // tearing the connection down on every refresh-token rotation.
  const tokenRef = useRef(token)
  useEffect(() => { tokenRef.current = token }, [token])

  useEffect(() => {
    if (!isAuthenticated) return
    socket.auth = { token: tokenRef.current }
    socket.connect()

    const onNew = (notification) => {
      dispatch(apiSlice.util.invalidateTags(['Notification']))
      if (notification?.title) toast(notification.title, { icon: '🔔' })
    }
    const onReconnectAttempt = () => {
      socket.auth = { token: tokenRef.current }
    }
    socket.on('notification:new', onNew)
    socket.io.on('reconnect_attempt', onReconnectAttempt)
    return () => {
      socket.off('notification:new', onNew)
      socket.io.off('reconnect_attempt', onReconnectAttempt)
      socket.disconnect()
    }
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!isAuthenticated) return null

  function onNotificationClick(n) {
    if (!n.isRead) markRead(n.id ?? n._id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)] nums">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
            <p className="text-sm font-semibold text-[var(--color-text)]">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="space-y-2 p-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            )}
            {!isLoading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-[var(--color-text-subtle)]">You're all caught up.</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id ?? n._id}
                className={`group flex items-start gap-2 border-b border-[var(--color-border)] px-4 py-3 last:border-0 ${n.isRead ? '' : 'bg-[var(--color-surface-2)]/60'}`}
              >
                {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />}
                <button type="button" onClick={() => onNotificationClick(n)} className="min-w-0 flex-1 text-left">
                  <p className={`truncate text-sm ${n.isRead ? 'text-[var(--color-text-muted)]' : 'font-medium text-[var(--color-text)]'}`}>{n.title}</p>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-subtle)]">{n.body}</p>}
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">{formatRelativeTime(n.createdAt)}</p>
                </button>
                <button
                  type="button"
                  aria-label="Delete notification"
                  onClick={() => deleteOne(n.id ?? n._id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-[var(--color-text-subtle)] hover:text-[var(--color-error)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
