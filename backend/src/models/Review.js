import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  body: { type: String, trim: true },
}, { timestamps: true })

// One review per user per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

// Recompute product's ratingAvg + ratingCount on save/remove.
async function recomputeRating(productId) {
  const [agg] = await mongoose.models.Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  await mongoose.models.Product.findByIdAndUpdate(productId, {
    ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0,
    ratingCount: agg ? agg.count : 0,
  })
}

reviewSchema.post('save', function () { return recomputeRating(this.product) })
reviewSchema.post('findOneAndDelete', function (doc) {
  return doc ? recomputeRating(doc.product) : null
})
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  return recomputeRating(this.product)
})

reviewSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  return obj
}

export const Review = mongoose.model('Review', reviewSchema)
