const fs = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'messy-matters'

if (!uri) {
  console.error('Please set MONGODB_URI environment variable')
  process.exit(1)
}

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  const feedbackFile = path.join(process.cwd(), 'data', 'feedback.json')
  const menuFile = path.join(process.cwd(), 'data', 'menu.json')

  const feedbackRaw = fs.readFileSync(feedbackFile, 'utf8')
  const menuRaw = fs.readFileSync(menuFile, 'utf8')

  const feedbackJson = JSON.parse(feedbackRaw)
  const menuJson = JSON.parse(menuRaw)

  if (feedbackJson.feedback && feedbackJson.feedback.length) {
    await db.collection('feedback').deleteMany({})
    await db.collection('feedback').insertMany(feedbackJson.feedback)
    console.log('Imported', feedbackJson.feedback.length, 'feedback docs')
  }

  // Upsert whole menu doc
  await db.collection('menu').updateOne({ _id: 'menu' }, { $set: { data: menuJson } }, { upsert: true })
  console.log('Upserted menu document')

  await client.close()
  console.log('Done')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
