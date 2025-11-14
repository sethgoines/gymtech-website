import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage(){
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const total = cart.reduce((s,i)=> s + i.price * i.quantity, 0)
  return (
    <div>
      <h1>Your cart</h1>
      {cart.length===0 ? (
        <div className="card">Your cart is empty. <Link to="/shop">Shop now</Link></div>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div>
                <div style={{fontWeight:600}}>{item.name}</div>
                <div style={{color:'#6b7280'}}>${item.price.toFixed(2)}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input type="number" value={item.quantity} min={1} style={{width:64}} onChange={(e)=> updateQuantity(item.id, Math.max(1, +e.target.value))} />
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{marginTop:12}}>
            <div style={{fontWeight:700}}>Total: ${total.toFixed(2)}</div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <Link to="/checkout" className="btn">Checkout</Link>
              <button onClick={clearCart}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
