// Force local fallback (avoid Firestore/emulator network calls during tests)
process.env.FIREBASE_PROJECT_ID = ''
process.env.USE_FIRESTORE_EMULATOR = ''
const request = require('supertest')
const app = require('../app')
const sinon = require('sinon')
const stripeLib = require('stripe')

describe('Stripe webhook', () => {
  let constructEventStub

  beforeEach(() => {
    // stub stripe.webhooks.constructEvent to return a fake event
    const stripe = require('stripe')()
    constructEventStub = sinon.stub().callsFake((body, sig, secret) => {
      return { type: 'checkout.session.completed', data: { object: { id: 'sess_123', metadata: { orderId: 'local-1' } } } }
    })
    // stub the stripe library used in webhook module
    const webhookModule = require('../webhook')
    // monkeypatch require cache for stripe used inside webhook
    const mod = require.cache[require.resolve('stripe')]
    // replace constructEvent via sinon on the real stripe instance
  })

  afterEach(() => {
    sinon.restore()
  })

  it('accepts webhook when no signature (dev)', async () => {
    const res = await request(app)
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .send({ type: 'checkout.session.completed', data: { object: { id: 'sess_1', metadata: { orderId: 'local-1' } } } })
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ received: true })
  })
})
