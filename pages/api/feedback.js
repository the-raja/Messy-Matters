import fs from 'fs'
import path from 'path'
import { getDb } from '../../lib/mongodb'

const file = path.join(process.cwd(), 'data', 'feedback.json')

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
      const data = await db.collection('feedback').find().sort({ createdAt: -1 }).toArray()
      return res.status(200).json({ feedback: data })
    }
    const data = await readJson()
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { day, meal, rating, comment, name, anonymous } = req.body
    const entry = {
      // keep id for compatibility with current UI
      id: Date.now(),
      day,
      meal,
      rating,
      comment,
      name: anonymous ? 'Anonymous' : name || 'Anonymous',
      createdAt: new Date().toISOString(),
    }

    if (db) {
      try {
        await db.collection('feedback').insertOne(entry)
        return res.status(200).json({ success: true, entry })
      } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'failed to save feedback' })
      }
    }

    try {
      const data = await readJson()
      data.feedback = data.feedback || []
      data.feedback.push(entry)
      await writeJson(data)
      return res.status(200).json({ success: true, entry })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'failed to save feedback' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
