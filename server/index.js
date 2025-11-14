require('dotenv').config()
const fs = require('fs')
const port = process.env.PORT || 4242
// Load Express app from app.js for testability
const app = require('./app')
const { saveOrder } = require('./orders-store')
const express = require('express')
const cors = require('cors')
const Stripe = require('stripe')

const stripeSecret = process.env.STRIPE_SECRET_KEY
if(!stripeSecret){
  console.warn('Warning: STRIPE_SECRET_KEY not set in server environment. Checkout will fail until you provide it.')
}

const stripe = Stripe(stripeSecret || '')

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Email API
try{
  const emailRouter = require('./email')
  app.use('/api', emailRouter)
}catch(e){
  console.warn('Email router not loaded', e)
}

// Stripe webhook
try{
  const webhook = require('./webhook')
  // webhook needs raw body; mount before body parser or use explicit route
  app.use('/', webhook)
}catch(e){
  console.warn('Webhook router not loaded', e)
}

// Serve built frontend (if present)
const path = require('path')
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  // For SPA client-side routing, serve index.html for unknown GET requests
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  console.warn('Static dist not found; build the client with `npm run build` to enable static serving')
}

app.get('/', (req, res) => res.send('GymTech Stripe server'))

app.post('/create-checkout-session', async (req, res) => {
  try {
    // log incoming request for debugging
    try {
      fs.writeFileSync('last_request.json', JSON.stringify({ path: req.path, body: req.body, at: new Date().toISOString() }, null, 2))
    } catch (e) {
      console.error('Failed to write last_request.json', e)
    }
    const { items } = req.body
    if(!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' })
    }

    const line_items = items.map(it => ({
      price_data: {
        currency: 'usd',
        product_data: { name: it.name },
        unit_amount: Math.round((it.price || 0) * 100)
      },
      quantity: it.quantity || 1
    }))

    // create a Stripe Checkout session and attach metadata (we'll write an order before redirect)
    // create a server-side pending order so we can reconcile on webhook
    const pending = { items, total: line_items.reduce((s, li) => s + (li.price_data.unit_amount/100) * li.quantity, 0), createdAt: new Date().toISOString(), paid: false }
    const saved = await saveOrder(pending)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:5173/?success=true',
      cancel_url: 'http://localhost:5173/?canceled=true'
    })
    // attach our order id into session metadata so webhook can map it back
    try{
      await stripe.checkout.sessions.update(session.id, { metadata: { orderId: saved.id } })
    }catch(e){
      console.warn('Failed to attach metadata to session', e)
    }
    // write session url to a file for debugging
    try {
      fs.appendFileSync('last_session.txt', `${new Date().toISOString()} ${session.url}\n`)
    } catch (e) {
      console.error('Failed to write last_session.txt', e)
    }

    res.json({ url: session.url })
  } catch (err) {
    console.error('Error creating checkout session', err)
    res.status(500).json({ error: err.message })
  }
})

// Debug endpoint: creates a checkout session and logs the full session object to server console.
app.post('/debug-create-checkout', async (req, res) => {
  try {
    // log incoming request for debugging
    try {
      fs.writeFileSync('last_request.json', JSON.stringify({ path: req.path, body: req.body, at: new Date().toISOString() }, null, 2))
    } catch (e) {
      console.error('Failed to write last_request.json', e)
    }
    const { items } = req.body
    if(!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' })
    }

    const line_items = items.map(it => ({
      price_data: {
        currency: 'usd',
        product_data: { name: it.name },
        unit_amount: Math.round((it.price || 0) * 100)
      },
      quantity: it.quantity || 1
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:5173/?success=true',
      cancel_url: 'http://localhost:5173/?canceled=true'
    })

    console.log('DEBUG: Created checkout session:', session)
    try {
      fs.appendFileSync('last_session.txt', `${new Date().toISOString()} ${session.url}\n`)
    } catch (e) {
      console.error('Failed to write last_session.txt', e)
    }
    res.json({ session })
  } catch (err) {
    console.error('Error creating debug checkout session', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(port, () => console.log(`Stripe server listening on http://localhost:${port}`))

// Debug endpoint to return last request and last session logs (if present)
app.get('/debug-last', (req, res) => {
  const result = {}
  try {
    if (fs.existsSync('last_request.json')) {
      result.lastRequest = JSON.parse(fs.readFileSync('last_request.json', 'utf8'))
    }
  } catch (e) {
    result.lastRequestError = String(e)
  }

  try {
    if (fs.existsSync('last_session.txt')) {
      result.lastSession = fs.readFileSync('last_session.txt', 'utf8')
    }
  } catch (e) {
    result.lastSessionError = String(e)
  }

  res.json(result)
})
