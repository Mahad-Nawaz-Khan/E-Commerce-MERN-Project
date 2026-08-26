import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { connectDB, disconnectDB } from '../config/db.js'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { Review } from '../models/Review.js'
import { Cart } from '../models/Cart.js'
import { Wishlist } from '../models/Wishlist.js'
import { Order } from '../models/Order.js'
import { categories } from './categories.seed.js'
import { users } from './users.seed.js'
import { products } from './products.seed.js'
import { generateOrders } from './orders.seed.js'

async function wipe() {
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({}),
    Review.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    Order.deleteMany({}),
  ])
  console.log('[seed] wiped collections')
}

export async function seed({ force = process.argv.includes('--force') } = {}) {
  if (!force) {
    throw new Error('[seed] this will wipe the database. Re-run with --force to confirm.')
  }

  await connectDB()
  try {
    console.log('[seed] starting…')
    await wipe()

    const catDocs = await Category.insertMany(categories)
    // Use create so User pre-save hooks hash the seeded passwords.
    const userDocs = await Promise.all(users.map((user) => User.create(user)))
    console.log(`[seed] ${catDocs.length} categories, ${userDocs.length} users`)

    // Map product category slug to the persisted category _id.
    const catBySlug = Object.fromEntries(catDocs.map((category) => [category.slug, category._id]))
    const productsWithCategory = products.map((product) => ({
      ...product,
      category: catBySlug[product.category] || catBySlug['home-lifestyle'],
    }))
    const productDocs = await Product.insertMany(productsWithCategory)
    console.log(`[seed] ${productDocs.length} products`)

    const reviews = productDocs.slice(0, 6).map((product) => ({
      product: product._id,
      user: userDocs[1]._id,
      rating: 4 + (product.name.length % 2),
      title: 'Great',
      body: 'Exactly as described.',
    }))
    // Use create so each Review post-save hook recomputes product ratings.
    await Promise.all(reviews.map((review) => Review.create(review)))
    console.log(`[seed] ${reviews.length} reviews`)

    // Generate historical orders across the customer base so the admin
    // dashboard, customer leaderboard, and analytics have rich data.
    const customers = userDocs.filter((u) => u.role === 'customer')
    const orderDocs = await generateOrders(customers, productDocs, 60)
    console.log(`[seed] ${orderDocs.length} orders`)

    console.log('[seed] done.')
    console.log('  Admin login:    admin@exclusive.test / Admin123!')
    console.log('  Customer login: customer@exclusive.test / Customer123!')
  } finally {
    await disconnectDB()
  }
}

const isDirectExecution = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isDirectExecution) {
  seed().catch((error) => {
    console.error('[seed] failed:', error.message)
    process.exitCode = 1
  })
}
