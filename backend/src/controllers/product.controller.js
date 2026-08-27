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

export const getHomepageData = asyncHandler(async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300')

  const cardFields = 'name slug price originalPrice images ratingAvg ratingCount tags isActive'

  const [featured, deals, bestsellers, newArrivals, explore, categories] = await Promise.all([
    Product.find({ tags: 'featured', isActive: true })
      .select(cardFields)
      .sort('-createdAt')
      .limit(8)
      .lean(),
    Product.find({ tags: 'todays-deal', isActive: true })
      .select(cardFields)
      .sort('-createdAt')
      .limit(8)
      .lean(),
    Product.find({ tags: 'bestseller', isActive: true })
      .select(cardFields)
      .sort('-ratingAvg')
      .limit(8)
      .lean(),
    Product.find({ tags: 'new', isActive: true })
      .select(cardFields)
      .sort('-createdAt')
      .limit(8)
      .lean(),
    Product.find({ isActive: true })
      .select(cardFields)
      .sort('-createdAt')
      .limit(24)
      .lean(),
    Category.find()
      .select('name slug image parent')
      .sort({ name: 1 })
      .lean(),
  ])

  const nodes = new Map(categories.map((cat) => [cat._id.toString(), { ...cat, id: String(cat._id), children: [] }]))
  const categoryTree = []
  for (const node of nodes.values()) {
    const parent = node.parent ? nodes.get(node.parent.toString()) : undefined
    if (parent) parent.children.push(node)
    else categoryTree.push(node)
  }

  const mapIds = (docs) => docs.map((doc) => ({ ...doc, id: String(doc._id) }))

  res.json({
    success: true,
    data: {
      featured: mapIds(featured),
      todaysDeals: mapIds(deals),
      bestsellers: mapIds(bestsellers),
      newArrivals: mapIds(newArrivals),
      explore: mapIds(explore),
      categories: categoryTree,
    },
  })
})

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
