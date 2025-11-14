// Ensure server orders-store uses file fallback in tests (avoid Firestore network calls)
process.env.FIREBASE_PROJECT_ID = ''
process.env.USE_FIRESTORE_EMULATOR = ''
const request = require('supertest')
const app = require('../app')
const fs = require('fs')
const path = require('path')
const { markEventProcessed } = require('../orders-store')

describe('webhook idempotency', () => {
  const event = {
    id: 'evt_test_123',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        metadata: { orderId: 'local-999' }
      }
    }
  }

  const processedFile = path.join(__dirname, '..', '..', 'data', 'processed-events.json')

  beforeEach(() => {
    // reset processed events file
    try{ fs.unlinkSync(processedFile) }catch(_){}
    // ensure local order exists
    const ordersFile = path.join(__dirname, '..', '..', 'data', 'local-orders.json')
    fs.mkdirSync(path.dirname(ordersFile), { recursive: true })
    fs.writeFileSync(ordersFile, JSON.stringify([{ id: 'local-999', items: [], paid: false }], null, 2))
  })

  it('processes an event only once', async () => {
    // first delivery
    let res = await request(app)
      .post('/webhook')
      .send(event)
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(200)

    // second delivery (duplicate)
    res = await request(app)
      .post('/webhook')
      .send(event)
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(200)

    // check processed-events file contains the id only once
    const arr = JSON.parse(fs.readFileSync(processedFile,'utf8'))
    const occurrences = arr.filter(x => x === event.id).length
    expect(occurrences).toBe(1)

    // check order marked paid
    const ordersFile = path.join(__dirname, '..', '..', 'data', 'local-orders.json')
    const orders = JSON.parse(fs.readFileSync(ordersFile,'utf8'))
    const order = orders.find(o => o.id === 'local-999')
    expect(order).toBeTruthy()
    expect(order.paid).toBeTruthy()
  })
})
