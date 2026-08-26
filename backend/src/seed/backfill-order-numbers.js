import crypto from 'crypto'
import { connectDB, disconnectDB } from '../config/db.js'
import { Order } from '../models/Order.js'

async function main() {
  await connectDB()
  // Rebuild indexes to pick up the new unique orderNumber index cleanly.
  await Order.syncIndexes()
  const orders = await Order.find({ $or: [{ orderNumber: { $exists: false } }, { orderNumber: null }, { orderNumber: '' }] })
  console.log('orders needing backfill:', orders.length)
  let updated = 0
  for (const o of orders) {
    const date = o.createdAt.toISOString().slice(0, 10).replaceAll('-', '')
    const orderNumber = `EX-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    try {
      await Order.updateOne({ _id: o._id }, { $set: { orderNumber } })
      updated += 1
    } catch (err) {
      console.log(`skip ${o._id}: ${err.message}`)
    }
  }
  console.log(`backfilled ${updated} orders with orderNumber`)
  await disconnectDB()
}

main().catch((err) => {
  console.error('backfill failed:', err.message)
  process.exitCode = 1
})
