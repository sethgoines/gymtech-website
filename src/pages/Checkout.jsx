import React, { useState } from 'react'
import { useCart } from '../context/CartContext'

// Real checkout flow: this component calls a local server endpoint that creates a Stripe Checkout session.
// You must run the server (server/index.js) and set STRIPE_SECRET_KEY in server/.env for real payments.
export default function Checkout(){
  const { cart, clearCart } = useCart()
  const [processing, setProcessing] = useState(false)
  const total = cart.reduce((s,i)=> s + i.price * i.quantity, 0)

  async function handlePay(){
    setProcessing(true)
    try{
      const res = await fetch('http://localhost:4242/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      })
      const data = await res.json()
      if(data.url){
        // Redirect the user to Stripe Checkout
        window.location.href = data.url
      } else {
        alert('Checkout error: ' + (data.error || 'Unknown error'))
      }
    }catch(err){
      console.error(err)
      alert('Checkout failed: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div>
      <h1>Checkout</h1>
      {cart.length===0 ? (
        <div className="card">Your cart is empty.</div>
      ) : (
        <div className="card">
          <div>Items: {cart.length}</div>
          <div style={{fontWeight:700, marginTop:8}}>Total: ${total.toFixed(2)}</div>
          <div style={{marginTop:12}}>
            <button className="btn" onClick={handlePay} disabled={processing}>{processing ? 'Processing...' : 'Pay now'}</button>
          </div>
          <div style={{marginTop:12,color:'#6b7280'}}>Note: this will open Stripe Checkout. Make sure the server is running and `server/.env` has your Stripe secret key.</div>
        </div>
      )}
    </div>
  )
}
