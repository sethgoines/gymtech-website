require('dotenv').config()
const nodemailer = require('nodemailer')

function createTransport(){
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT && parseInt(process.env.SMTP_PORT,10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if(!host || !port){
    throw new Error('SMTP_HOST and SMTP_PORT must be set in server/.env to send emails')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(port) === '465',
    auth: user ? { user, pass } : undefined
  })
}

async function sendOrderEmail(order, opts = {}){
  const transporter = createTransport()
  const to = opts.to || process.env.ADMIN_EMAIL
  if(!to) throw new Error('No recipient configured (ADMIN_EMAIL)')

  const filename = `order-${order.id || Date.now()}.json`
  const subject = opts.subject || `New order ${order.id || ''}`
  const body = opts.text || `Order ${order.id || ''} attached.`

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@localhost',
    to,
    subject,
    text: body,
    attachments: [{ filename, content: JSON.stringify(order, null, 2) }]
  })

  return info
}

module.exports = { sendOrderEmail }
