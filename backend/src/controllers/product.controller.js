import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

// Resolve category slug → _id for filtering when ?category=<slug> is passed.
async function resolveCategoryFilter(query) {
  if (query.category) {
    const cat = await Category.findOne({ $or: [{ slug: query.category }, { name: query.category }] })
    if (cat) { query.category = cat._id.toString() }
  }
}

export const getProducts = asyncHandler(async (req, res) => {
  await resolveCategoryFilter(req.query)
  const result = await paginateQuery(Product, req.query, {
    searchFields: ['name', 'description', 'brand'],
    baseFilter: { isActive: true },
  })
  res.json({ success: true, ...result })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug')
  if (!product) throw ApiError.notFound('Product not found')
  res.json({ success: true, data: product })
})

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json({ success: true, data: product })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!product) throw ApiError.notFound('Product not found')
  res.json({ success: true, data: product })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) throw ApiError.notFound('Product not found')
  res.json({ success: true, data: { message: 'Product deleted' } })
})
