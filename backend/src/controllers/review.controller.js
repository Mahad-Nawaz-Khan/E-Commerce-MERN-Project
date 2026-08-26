import { Review } from '../models/Review.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { notifyAdminsOfReview } from '../services/notification.js'

export const getReviewsForProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name')
    .sort('-createdAt')
  res.json({ success: true, data: reviews })
})

export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) throw ApiError.notFound('Product not found')
  try {
    const review = await Review.create({
      product: product._id, user: req.user._id,
      rating: req.body.rating, title: req.body.title, body: req.body.body,
    })
    void notifyAdminsOfReview(review, product)
    res.status(201).json({ success: true, data: review })
  } catch (err) {
    if (err.code === 11000) throw ApiError.conflict('You have already reviewed this product')
    throw err
  }
})

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw ApiError.notFound('Review not found')
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only edit your own review')
  }
  review.rating = req.body.rating ?? review.rating
  review.title = req.body.title ?? review.title
  review.body = req.body.body ?? review.body
  await review.save()
  res.json({ success: true, data: review })
})

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) throw ApiError.notFound('Review not found')
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only delete your own review')
  }
  await Review.deleteOne({ _id: review._id })
  res.json({ success: true, data: { message: 'Review deleted' } })
})
