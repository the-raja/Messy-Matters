export default function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  const { password } = req.body || {}
  // In real app, use proper auth; demo password is 'warden123'
  if (password === 'warden123'){
    // Set an HttpOnly cookie
    res.setHeader('Set-Cookie', 'warden=1; Path=/; HttpOnly; Max-Age=3600')
    return res.status(200).json({ success: true })
  }
  return res.status(401).json({ success: false })
}
