import { Category } from '../models/Category.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { paginateQuery } from '../utils/queryService.js'

export const getCategories = asyncHandler(async (req, res) => {
  const { data, pagination } = await paginateQuery(Category, { limit: 100, ...req.query }, {})
  res.json({ success: true, data, pagination })
})

/**
 * Nested category tree from the `parent` field. Single pass, no recursion —
 * a malformed parent cycle simply drops those nodes instead of hanging.
 */
export const getCategoryTree = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean()
  const nodes = new Map(categories.map((cat) => [cat._id.toString(), { ...cat, children: [] }]))
  const roots = []
  for (const node of nodes.values()) {
    const parent = node.parent ? nodes.get(node.parent.toString()) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  res.json({ success: true, data: roots })
})

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ $or: [{ slug: req.params.id }, { _id: req.params.id }] })
  if (!category) throw ApiError.notFound('Category not found')
  res.json({ success: true, data: category })
})

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body)
  res.status(201).json({ success: true, data: category })
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!category) throw ApiError.notFound('Category not found')
  res.json({ success: true, data: category })
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) throw ApiError.notFound('Category not found')
  res.json({ success: true, data: { message: 'Category deleted' } })
})
