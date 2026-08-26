import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId })
  if (!cart) cart = await Cart.create({ user: userId, items: [] })
  return cart
}

export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id)
  await cart.populate('items.product', 'name price slug images stock isActive')
  res.json({ success: true, data: cart })
})

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color, size } = req.body
  const product = await Product.findById(productId)
  if (!product || !product.isActive) throw ApiError.notFound('Product not found')
  if (product.stock <= 0) throw ApiError.badRequest('Product is out of stock')
  const cart = await getCart(req.user._id)
  const getColorKey = (c) => (typeof c === 'object' && c !== null ? (c.name || c.value || JSON.stringify(c)) : String(c ?? ''))
  const existing = cart.items.find((i) =>
    i.product.toString() === productId &&
    getColorKey(i.color) === getColorKey(color) &&
    (i.size || '') === (size || ''))
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock)
  } else {
    cart.items.push({ product: productId, quantity: Math.min(quantity, product.stock), color, size })
  }
  await cart.save()
  res.json({ success: true, data: cart })
})

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body
  const cart = await getCart(req.user._id)
  const item = cart.items.id(req.params.itemId)
  if (!item) throw ApiError.notFound('Cart item not found')
  const product = await Product.findById(item.product)
  if (product && quantity > product.stock) throw ApiError.badRequest(`Only ${product.stock} in stock`)
  if (quantity <= 0) { cart.items.pull(item); }
  else { item.quantity = quantity }
  await cart.save()
  res.json({ success: true, data: cart })
})

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id)
  cart.items.pull(req.params.itemId)
  await cart.save()
  res.json({ success: true, data: cart })
})

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id)
  cart.items = []
  await cart.save()
  res.json({ success: true, data: cart })
})
