import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { saveOrder } from '../lib/db'

// This component watches for a `?success=true` URL param (Stripe Checkout redirect)
// and, if a user is signed in and Firestore is configured, writes an `orders` document
// with the items from localStorage then clears the cart.
export default function OrderHandler(){
  const location = useLocation()
  const { clearCart } = useCart()
  const [handled, setHandled] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const success = params.get('success') === 'true'
    if(!success || handled) return

    // read cart from localStorage (CartContext persists there)
    let items = []
    try{ items = JSON.parse(localStorage.getItem('gymtech_cart') || '[]') }catch(e){ items = [] }

    if(!items || items.length === 0){
      setHandled(true)
      return
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      const payload = {
        userId: user ? user.uid : null,
        userEmail: user ? user.email || null : null,
        items
      }

      try{
        await saveOrder(payload)
        // clear cart after recording order
        clearCart()
        setHandled(true)
        // optionally notify the user
        // eslint-disable-next-line no-alert
        alert('Payment successful — order recorded.')
      }catch(err){
        console.error('Failed to record order', err)
        setHandled(true)
      }
    })

    return () => unsub()
  }, [location.search, handled, clearCart])

  return null
}
