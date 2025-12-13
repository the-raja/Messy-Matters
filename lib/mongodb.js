import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const dbName = process.env.MONGODB_DB || 'messy-matters'

// When running without a DB, allow the app to run locally.
// Consumers should check for `null` when calling these helpers.
let cachedClient = global._mongoClient || null
let cachedDb = global._mongoDb || null

export async function getClient() {
  if (!uri) return null
  if (cachedClient) return cachedClient
  const client = new MongoClient(uri)
  await client.connect()
  cachedClient = client
  // store in global so next lambda invocation reuses connection
  global._mongoClient = client
  return client
}

export async function getDb() {
  if (!uri) return null
  if (cachedDb) return cachedDb
  const client = await getClient()
  const db = client.db(dbName)
  cachedDb = db
  global._mongoDb = db
  return db
}

export default { getDb, getClient }
