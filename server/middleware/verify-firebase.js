require('dotenv').config()
const admin = require('../admin')

async function verifyIdToken(req, res, next){
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-id-token'] || '')
  if(!token) return res.status(401).json({ error: 'Missing auth token' })
  try{
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = decoded
    return next()
  }catch(e){
    console.warn('verifyIdToken failed', e && e.message)
    return res.status(401).json({ error: 'Invalid auth token' })
  }
}

function requireAdmin(req, res, next){
  // If ADMIN_SECRET provided and matches header, allow
  const adminSecret = process.env.ADMIN_SECRET
  if(adminSecret){
    const h = req.headers['x-admin-secret'] || (req.body && req.body.adminSecret)
    if(h === adminSecret) return next()
  }

  // Otherwise require that req.user exists and has admin claim or be in ADMIN_UIDS
  const adminUids = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean)
  if(req.user){
    if(req.user.admin === true) return next()
    if(adminUids.includes(req.user.uid)) return next()
  }

  return res.status(403).json({ error: 'Forbidden' })
}

module.exports = { verifyIdToken, requireAdmin }
