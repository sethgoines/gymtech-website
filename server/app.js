require('dotenv').config()
const express = require('express')
const Stripe = require('stripe')

const app = express()

// Mount webhook first (it uses raw body internally and must run before body parsers)
try{
  const webhook = require('./webhook')
  app.use('/', webhook)
}catch(e){
  console.warn('Webhook router not loaded in app', e)
}

// Mount API routes and JSON body parser for other endpoints
app.use(express.json())

// Mount email API if present
try{
  const emailRouter = require('./email')
  app.use('/api', emailRouter)
}catch(e){
  console.warn('Email router not loaded in app', e)
}

module.exports = app
