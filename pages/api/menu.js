import fs from 'fs'
import path from 'path'
import { getDb } from '../../lib/mongodb'

const file = path.join(process.cwd(), 'data', 'menu.json')

async function readJson() {
  const raw = fs.readFileSync(file, 'utf8')
  return JSON.parse(raw)
}

async function writeJson(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  const db = await getDb()

  if (req.method === 'GET') {
    if (db) {
      const doc = await db.collection('menu').findOne({ _id: 'menu' })
      return res.status(200).json(doc ? doc.data : { week: {} })
    }
    const data = await readJson()
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    // check cookie for warden auth before allowing menu edits
    const cookie = req.headers.cookie || ''
    const isWarden = cookie.split(';').map(c=>c.trim()).some(c => c === 'warden=1')
    if (!isWarden) return res.status(401).json({ error: 'unauthorized' })

    const { day, meal, items } = req.body

    if (db) {
      try {
        const update = { $set: { [`data.week.${day}.${meal}`]: items } }
        await db.collection('menu').updateOne({ _id: 'menu' }, update, { upsert: true })
        return res.status(200).json({ success: true })
      } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'failed to update' })
      }
    }

    try {
      const data = await readJson()
      if (!data.week) data.week = {}
      if (!data.week[day]) data.week[day] = {}
      data.week[day][meal] = items
      await writeJson(data)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'failed to update' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
