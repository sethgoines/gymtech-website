require('dotenv').config()
const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '')
const rawBody = express.raw({ type: 'application/json' })
const { markOrderPaid } = require('./orders-store')

// Webhook endpoint: verifies signature and handles checkout.session.completed
router.post('/webhook', rawBody, async (req, res) => {
  const sig = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  let event
  console.debug('[webhook] received request, headers:', Object.keys(req.headers))
  try{
    console.debug('[webhook] req.body type:', Object.prototype.toString.call(req.body))
  }catch(_){ }
  try{
    if(secret){
      // When secret is set we must use the raw body Buffer for verification
      event = stripe.webhooks.constructEvent(req.body, sig, secret)
    } else {
      // Dev: accept either a Buffer/Uint8Array (raw) or an already-parsed JSON body
      if (Buffer.isBuffer(req.body) || req.body instanceof Uint8Array) {
        // convert to string safely
        const s = typeof req.body.toString === 'function' ? req.body.toString() : Buffer.from(req.body).toString()
        event = JSON.parse(s)
      } else {
        event = req.body
      }
    }
  }catch(e){
    console.error('Webhook signature verification failed', e && e.message ? e.message : e)
    return res.status(400).send(`Webhook error: ${e && e.message ? e.message : e}`)
  }

  try{
    // idempotency: skip if we've already processed this event
    const { isEventProcessed, markEventProcessed } = require('./orders-store')
    if(event.id){
      const seen = await isEventProcessed(event.id)
      if(seen){
        console.log('Event already processed, skipping:', event.id)
        return res.json({ received: true })
      }
    }

    switch(event.type){
      case 'checkout.session.completed':{
        const session = event.data.object
        const orderId = session.metadata && session.metadata.orderId
        if(orderId){
          await markOrderPaid(orderId, { paidAt: new Date().toISOString(), stripeSessionId: session.id })
          console.log('Order marked paid:', orderId)
          // Send notification email to admin if SMTP configured
          try{
            const { sendOrderEmail } = require('./emailer')
            // prefer local file first (fast, avoids contacting Firestore during tests)
            let order = null
            try{ order = require('../data/local-orders.json').find(o => o.id === orderId) }catch(e){ order = null }
            // if not found locally and Firestore is configured, try Firestore
            if(!order && (process.env.FIREBASE_PROJECT_ID || process.env.USE_FIRESTORE_EMULATOR)){
              try{
                const admin = require('./admin')
                const db = admin.firestore()
                const doc = await db.collection('orders').doc(orderId).get()
                if(doc && doc.exists) order = { id: doc.id, ...doc.data() }
              }catch(e){
                console.warn('Failed to read order from Firestore on webhook (continuing):', e && e.message ? e.message : e)
              }
            }
            if(order){
              await sendOrderEmail(order)
            }
          }catch(e){
            console.warn('Failed to send order email on webhook', e)
          }
        } else {
          console.log('checkout.session.completed but no orderId metadata')
        }
        break
      }
      case 'payment_intent.succeeded':{
        const pi = event.data.object
        console.log('PaymentIntent succeeded', pi.id)
        break
      }
      default:
        console.log('Unhandled stripe event type', event.type)
    }

    if(event.id){
      try{
        console.debug('[webhook] about to mark event processed:', event.id)
        await markEventProcessed(event.id)
        console.debug('[webhook] markEventProcessed finished for:', event.id)
      }catch(e){ console.warn('Failed to mark event processed', e) }
    }
  }catch(e){
    console.error('Error handling webhook event', e)
    return res.status(500).send('Server error')
  }

  console.debug('[webhook] responding with received:true')
  res.json({ received: true })
})

module.exports = router
