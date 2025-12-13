export default function handler(req, res){
  const cookie = req.headers.cookie || ''
  const isWarden = cookie.split(';').map(c=>c.trim()).some(c => c === 'warden=1')
  res.status(200).json({ authed: !!isWarden })
}
