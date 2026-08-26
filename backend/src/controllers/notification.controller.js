import { Notification } from '../models/Notification.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

export const getNotifications = asyncHandler(async (req, res) => {
  // ?unread=1 keeps the panel focused on what's new.
  const query = { ...req.query, limit: req.query.limit || 15 }
  if (query.unread === '1') query.isRead = false
  delete query.unread
  const { data, pagination } = await paginateQuery(Notification, query, {
    baseFilter: { user: req.user._id },
  })
  res.json({ success: true, data, pagination })
})

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false })
  res.json({ success: true, data: { count } })
})

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true },
  )
  if (!notification) throw ApiError.notFound('Notification not found')
  res.json({ success: true, data: notification })
})

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() },
  )
  res.json({ success: true, data: { updated: result.modifiedCount } })
})

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!notification) throw ApiError.notFound('Notification not found')
  res.json({ success: true, data: { message: 'Notification deleted' } })
})
