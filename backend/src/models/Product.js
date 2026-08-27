import mongoose from 'mongoose'

const colorSchema = new mongoose.Schema({ name: String, value: String }, { _id: false })

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, trim: true },
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price must be ≥ 0'] },
  originalPrice: { type: Number, min: 0, default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, trim: true },
  images: [{ type: String, trim: true }],
  stock: { type: Number, default: 0, min: [0, 'Stock must be ≥ 0'] },
  sku: { type: String, unique: true, sparse: true, trim: true },
  colors: [colorSchema],
  sizes: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true })

productSchema.pre('validate', async function makeSlug() {
  if (this.isModified('name') && !this.slug) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    let slug = base || 'product'
    let i = 1
    while (await mongoose.models.Product.exists({ slug })) slug = `${base}-${i++}`
    this.slug = slug
  }
})

// Virtual alias for filtering convenience.
productSchema.virtual('comparePrice').get(function () { return this.price })

productSchema.index({ name: 'text', description: 'text', brand: 'text' })
productSchema.index({ category: 1, isActive: 1, price: 1, ratingAvg: -1 })
productSchema.index({ tags: 1, isActive: 1, createdAt: -1 })
productSchema.index({ isActive: 1, createdAt: -1 })

export const Product = mongoose.model('Product', productSchema)
