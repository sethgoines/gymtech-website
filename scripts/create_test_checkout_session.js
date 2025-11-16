#!/usr/bin/env node
// Helper: calls backend /create-checkout-session to create a test Stripe session
// Usage: BACKEND_URL=http://localhost:3000 node scripts/create_test_checkout_session.js

const BACKEND = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3000'
const endpoint = `${BACKEND.replace(/\/$/,'')}/create-checkout-session`

async function main(){
  const body = {
    items: [
      { id: 'test-1', name: 'Test Product', price: 1999, quantity: 1 }
    ],
    success_url: 'http://localhost:5173?success=true',
    cancel_url: 'http://localhost:5173?canceled=true'
  }

  console.log('Calling', endpoint)
  const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if(!res.ok){
    console.error('Request failed', res.status, await res.text())
    process.exit(2)
  }
  const data = await res.json()
  console.log('Response:', data)
  if(data.url) console.log('\nOpen this URL in a browser to complete the test checkout:\n', data.url)
}

main().catch(e=>{ console.error(e); process.exit(1) })
