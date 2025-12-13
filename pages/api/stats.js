import fs from 'fs'
import path from 'path'
import { getDb } from '../../lib/mongodb'

const file = path.join(process.cwd(), 'data', 'feedback.json')

async function readJson() {
  const raw = fs.readFileSync(file, 'utf8')
  return JSON.parse(raw)
}

export default async function handler(req, res) {
  const db = await getDb()
  let feedback = []

  if (db) {
    feedback = await db.collection('feedback').find().toArray()
  } else {
    const data = await readJson()
    feedback = data.feedback || []
  }

  const byMeal = {}
  feedback.forEach(f => {
    const key = `${f.day || 'unknown'}|${f.meal || 'unknown'}`
    if (!byMeal[key]) byMeal[key] = { count:0, sum:0, comments: [] }
    byMeal[key].count++
    byMeal[key].sum += (Number(f.rating) || 0)
    if (f.comment) byMeal[key].comments.push(f.comment)
  })

  const avg = {}
  Object.keys(byMeal).forEach(k=>{
    avg[k] = { avg: byMeal[k].sum / Math.max(1, byMeal[k].count), ...byMeal[k] }
  })

  res.status(200).json({ total: feedback.length, byMeal: avg, feedback })
}
