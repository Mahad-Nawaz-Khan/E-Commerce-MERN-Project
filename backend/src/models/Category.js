import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, trim: true },
  image: { type: String, trim: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true })

// Collision-safe slug generation.
categorySchema.pre('validate', async function makeSlug() {
  if (this.isModified('name') && !this.slug) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    let slug = base || 'category'
    let i = 1
    while (await mongoose.models.Category.exists({ slug })) slug = `${base}-${i++}`
    this.slug = slug
  }
})

export const Category = mongoose.model('Category', categorySchema)
