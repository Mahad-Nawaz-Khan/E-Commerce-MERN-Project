import { Wishlist } from '../models/Wishlist.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

async function getWishlist(userId) {
  let w = await Wishlist.findOne({ user: userId })
  if (!w) w = await Wishlist.create({ user: userId, products: [] })
  return w
}

export const getMyWishlist = asyncHandler(async (req, res) => {
  const w = await getWishlist(req.user._id)
  await w.populate('products', 'name price slug images ratingAvg')
  res.json({ success: true, data: w })
})

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body
  if (!(await Product.exists({ _id: productId, isActive: true }))) throw ApiError.notFound('Product not found')
  const w = await getWishlist(req.user._id)
  const i = w.products.findIndex((p) => p.toString() === productId)
  const added = i === -1
  if (added) w.products.push(productId)
  else w.products.splice(i, 1)
  await w.save()
  res.json({ success: true, data: { added, wishlist: w } })
})

export const removeWishlistItem = asyncHandler(async (req, res) => {
  const w = await getWishlist(req.user._id)
  w.products = w.products.filter((p) => p.toString() !== req.params.productId)
  await w.save()
  res.json({ success: true, data: w })
})

export const clearWishlist = asyncHandler(async (req, res) => {
  const w = await getWishlist(req.user._id)
  w.products = []
  await w.save()
  res.json({ success: true, data: w })
})
