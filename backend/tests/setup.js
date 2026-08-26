import './_env.js'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { connectDB, disconnectDB } from '../src/config/db.js'

let mongoReplSet

beforeAll(async () => {
  mongoReplSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  })
  await connectDB(mongoReplSet.getUri())
})

afterEach(async () => {
  const { collections } = mongoose.connection
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})))
})

afterAll(async () => {
  await disconnectDB()
  if (mongoReplSet) await mongoReplSet.stop()
})
