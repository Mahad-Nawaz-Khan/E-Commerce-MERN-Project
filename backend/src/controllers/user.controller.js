import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

export const getUsers = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginateQuery(User, req.query, {})
  res.json({ success: true, data, pagination })
})

export const getUser = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not allowed')
  }
  const user = await User.findById(req.params.id)
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: user })
})

export const updateUser = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not allowed')
  }
  const updates = { ...req.body }
  // Only admins can change role.
  if (updates.role && req.user.role !== 'admin') delete updates.role
  // Never allow password update via this route (use reset flow).
  delete updates.password
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: user })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: { message: 'User deleted' } })
})

// Address management
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses defaultAddressId')
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: { addresses: user.addresses, defaultAddressId: user.defaultAddressId } })
})

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) throw ApiError.notFound('User not found')
  
  const newAddress = user.addAddress(req.body)
  await user.save()
  
  res.status(201).json({ success: true, data: newAddress })
})

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) throw ApiError.notFound('User not found')
  
  const updatedAddress = user.updateAddress(req.params.addressId, req.body)
  if (!updatedAddress) throw ApiError.notFound('Address not found')
  
  await user.save()
  res.json({ success: true, data: updatedAddress })
})

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) throw ApiError.notFound('User not found')
  
  const deleted = user.removeAddress(req.params.addressId)
  if (!deleted) throw ApiError.notFound('Address not found')
  
  await user.save()
  res.json({ success: true, data: { message: 'Address deleted' } })
})

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) throw ApiError.notFound('User not found')
  
  const success = user.setDefaultAddress(req.params.addressId)
  if (!success) throw ApiError.notFound('Address not found')
  
  await user.save()
  res.json({ success: true, data: { defaultAddressId: user.defaultAddressId } })
})

// Password change
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Current and new password required')
  }
  
  if (newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters')
  }
  
  const user = await User.findById(req.user._id).select('+password')
  if (!user) throw ApiError.notFound('User not found')
  
  // Verify current password
  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) throw ApiError.unauthorized('Current password is incorrect')
  
  user.password = newPassword
  await user.save()
  
  res.json({ success: true, data: { message: 'Password updated successfully' } })
})

// Customer statistics
export const getUserStats = asyncHandler(async (req, res) => {
  const { Order } = await import('../models/Order.js')
  
  const stats = await Order.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
      }
    }
  ])
  
  const ordersByStatus = await Order.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])
  
  const statusMap = ordersByStatus.reduce((acc, item) => {
    acc[item._id] = item.count
    return acc
  }, {})
  
  res.json({
    success: true,
    data: {
      totalOrders: stats[0]?.totalOrders || 0,
      totalSpent: stats[0]?.totalSpent || 0,
      ordersByStatus: statusMap
    }
  })
})
