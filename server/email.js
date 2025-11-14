require('dotenv').config()
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

// Simple middleware to check a shared ADMIN_SECRET (optional)
const { verifyIdToken, requireAdmin } = require('./middleware/verify-firebase')

// Accept either admin secret (legacy) OR a verified Firebase ID token with admin privileges
async function authOrSecret(req, res, next){
  const secret = process.env.ADMIN_SECRET
  const h = req.headers['x-admin-secret'] || req.body && req.body.adminSecret
  if(secret && h === secret) return next()
  // otherwise verify ID token
  return verifyIdToken(req, res, async () => {
    // then check admin rights
    return requireAdmin(req, res, next)
  })
}

router.post('/send-orders', authOrSecret, async (req, res) => {
  try {
  const { userId, format = 'json', to, orders = [] } = req.body || {}
    let payload
    let filename = `orders-${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`

    if(format === 'csv'){
      // Simple CSV conversion
      const rows = []
      rows.push(['id','createdAt','userEmail','items'])
      orders.forEach(o => {
        const items = (o.items||[]).map(i => `${i.name} x${i.quantity||i.qty||1}`).join('; ')
        rows.push([o.id, o.createdAt || '', o.userEmail || '', items])
      })
      payload = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    } else {
      payload = JSON.stringify(orders, null, 2)
    }

    // Configure transporter from env
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
  const adminEmail = (process.env.ADMIN_EMAIL || to)
    if(!adminEmail){
      return res.status(400).json({ error: 'No admin email configured (ADMIN_EMAIL) or `to` provided' })
    }

    let transporter
    if(smtpHost && smtpPort){
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort,10),
        secure: String(smtpPort) === '465',
        auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined
      })
    } else {
      return res.status(400).json({ error: 'No SMTP or SendGrid configuration found in env' })
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `noreply@localhost`,
      to: adminEmail,
      subject: `GymTech orders export - ${new Date().toISOString()}`,
      text: format === 'csv' ? payload : undefined,
      attachments: [
        { filename, content: payload }
      ]
    })

    res.json({ ok: true, info })
  } catch (e) {
    console.error('Failed to send orders email', e)
    res.status(500).json({ error: String(e) })
  }
})

module.exports = router
