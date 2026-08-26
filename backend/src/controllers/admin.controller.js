import { User } from '../models/User.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { Review } from '../models/Review.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

// Customer Analytics
export const getCustomerStats = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, search = '', sort = 'totalSpent' } = req.query

  const matchStage = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {}

  const customers = await User.aggregate([
    { $match: { role: 'customer', ...matchStage } },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'user',
        as: 'orders',
      },
    },
    {
      $addFields: {
        totalOrders: { $size: '$orders' },
        totalSpent: { $sum: '$orders.totalAmount' },
        lastOrder: { $max: '$orders.createdAt' },
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        phone: 1,
        totalOrders: 1,
        totalSpent: 1,
        lastOrderDate: '$lastOrder',
        joinDate: '$createdAt',
      },
    },
    { $sort: { [sort === 'totalSpent' ? 'totalSpent' : 'totalOrders']: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ])

  const total = await User.countDocuments({ role: 'customer', ...matchStage })

  res.json({
    success: true,
    data: customers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

export const getCustomerHistory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) throw ApiError.notFound('Customer not found')

  const orders = await Order.find({ user: id })
    .populate('items.product', 'name slug images')
    .sort('-createdAt')

  res.json({ success: true, data: orders })
})

// Sales Analytics
export const getSalesOverview = asyncHandler(async (req, res) => {
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Total revenue and orders
  const allTimeStats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' },
      },
    },
  ])

  const last30DaysStats = await Order.aggregate([
    { $match: { createdAt: { $gte: last30Days } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
  ])

  const last7DaysStats = await Order.aggregate([
    { $match: { createdAt: { $gte: last7Days } } },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
  ])

  // Order status breakdown
  const statusBreakdown = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  // Revenue by payment method
  const paymentMethodRevenue = await Order.aggregate([
    {
      $group: {
        _id: '$paymentMethod',
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
  ])

  // Top 5 selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        productId: '$_id',
        name: '$product.name',
        slug: '$product.slug',
        image: { $arrayElemAt: ['$product.images', 0] },
        quantity: 1,
        revenue: 1,
      },
    },
  ])

  res.json({
    success: true,
    data: {
      allTime: {
        totalRevenue: allTimeStats[0]?.totalRevenue || 0,
        totalOrders: allTimeStats[0]?.totalOrders || 0,
        avgOrderValue: allTimeStats[0]?.avgOrderValue || 0,
      },
      last30Days: {
        revenue: last30DaysStats[0]?.revenue || 0,
        orders: last30DaysStats[0]?.orders || 0,
      },
      last7Days: {
        revenue: last7DaysStats[0]?.revenue || 0,
        orders: last7DaysStats[0]?.orders || 0,
      },
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      paymentMethodRevenue,
      topProducts,
    },
  })
})

export const getSalesTrends = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query

  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const trends = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
        },
        revenue: 1,
        orders: 1,
      },
    },
  ])

  res.json({ success: true, data: trends })
})

// Inventory Analytics
export const getInventoryStats = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, stockFilter = 'all' } = req.query
  const lowStockThreshold = 10

  let filter = { isActive: true }
  if (stockFilter === 'low') {
    filter.stock = { $gt: 0, $lte: lowStockThreshold }
  } else if (stockFilter === 'out') {
    filter.stock = 0
  }

  const products = await Product.find(filter)
    .select('name slug stock price images')
    .sort('stock')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))

  const total = await Product.countDocuments(filter)

  // Stock distribution
  const stockDistribution = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $bucket: {
        groupBy: '$stock',
        boundaries: [0, 1, 11, 51, 101, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: { $push: '$name' },
        },
      },
    },
  ])

  // Low stock alerts
  const lowStockCount = await Product.countDocuments({
    isActive: true,
    stock: { $gt: 0, $lte: lowStockThreshold },
  })

  const outOfStockCount = await Product.countDocuments({
    isActive: true,
    stock: 0,
  })

  // Total stock value
  const stockValue = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
      },
    },
  ])

  res.json({
    success: true,
    data: {
      products,
      stockDistribution,
      lowStockCount,
      outOfStockCount,
      totalStockValue: stockValue[0]?.totalValue || 0,
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

// Category Analytics
export const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const categoryStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        productCount: { $sum: 1 },
        avgRating: { $avg: '$ratingAvg' },
      },
    },
    {
      $lookup: {
        from: 'orders',
        let: { categoryId: '$_id' },
        pipeline: [
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: '$product' },
          { $match: { $expr: { $eq: ['$product.category', '$$categoryId'] } } },
          {
            $group: {
              _id: null,
              revenue: {
                $sum: { $multiply: ['$items.price', '$items.quantity'] },
              },
              orders: { $sum: 1 },
            },
          },
        ],
        as: 'orderStats',
      },
    },
    {
      $project: {
        categoryName: 1,
        productCount: 1,
        avgRating: 1,
        revenue: { $ifNull: [{ $arrayElemAt: ['$orderStats.revenue', 0] }, 0] },
        orders: { $ifNull: [{ $arrayElemAt: ['$orderStats.orders', 0] }, 0] },
      },
    },
    { $sort: { revenue: -1 } },
  ])

  res.json({ success: true, data: categoryStats })
})

// Bulk product operations
export const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { ids, updates } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest('Product IDs required')
  }

  const result = await Product.updateMany(
    { _id: { $in: ids } },
    { $set: updates },
    { runValidators: true }
  )

  res.json({
    success: true,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  })
})

export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids, hard = false } = req.body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest('Product IDs required')
  }

  let result
  if (hard === 'true' || hard === true) {
    result = await Product.deleteMany({ _id: { $in: ids } })
  } else {
    result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: false } }
    )
  }

  res.json({
    success: true,
    data: {
      deletedCount: result.deletedCount || result.modifiedCount,
    },
  })
})

// Admin product list — returns ALL products (incl. inactive), paginated/filterable.
export const getAdminProducts = asyncHandler(async (req, res) => {
  const query = { ...req.query }

  // Resolve category slug → _id when passed as a filter.
  if (query.category) {
    const cat = await Category.findOne({ $or: [{ slug: query.category }, { name: query.category }] })
    if (cat) query.category = cat._id.toString()
  }

  // Stock-tier filter — translates a friendly label to a stock range.
  if (query.stockFilter) {
    if (query.stockFilter === 'low') query.stock = { ...query.stock, $gt: 0, $lte: 10 }
    else if (query.stockFilter === 'out') query.stock = { ...query.stock, $eq: 0 }
    else if (query.stockFilter === 'instock') query.stock = { ...query.stock, $gt: 10 }
    delete query.stockFilter
  }

  const result = await paginateQuery(Product, query, {
    searchFields: ['name', 'description', 'brand', 'sku'],
    // No isActive baseFilter — admins see everything.
  })

  res.json({ success: true, ...result })
})

// Admin order list — paginated with status/payment/customer filters + search.
export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, status, paymentStatus, search } = req.query
  const filter = {}

  if (status && status !== 'all') filter.status = status
  if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus

  // Search by customer name/email via a user $in lookup.
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id')
    filter.user = { $in: users.map((u) => u._id) }
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [data, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name slug images')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean({ getters: true }),
    Order.countDocuments(filter),
  ])

  res.json({
    success: true,
    // Lean docs skip the `id` virtual — add it for frontend consumers.
    data: data.map((order) => ({ ...order, id: String(order._id) })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  })
})

// All reviews across products — paginated, filterable by rating/product.
export const getAdminReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, rating, product } = req.query
  const filter = {}
  if (rating) filter.rating = Number(rating)
  if (product) filter.product = product

  const skip = (Number(page) - 1) * Number(limit)
  const [data, total] = await Promise.all([
    Review.find(filter)
      .populate('product', 'name slug images')
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean({ getters: true }),
    Review.countDocuments(filter),
  ])

  res.json({
    success: true,
    // Lean docs skip the `id` virtual — add it for frontend consumers.
    data: data.map((review) => ({ ...review, id: String(review._id) })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  })
})

// Dashboard customer-count stat (used by the admin overview cards).
export const getCustomerCount = asyncHandler(async (req, res) => {
  const total = await User.countDocuments({ role: 'customer' })
  res.json({ success: true, data: { total } })
})
