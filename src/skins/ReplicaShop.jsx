import React from 'react'
import './replica.css'
import { products } from '../data/products'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ReplicaShop(){
  const { addToCart } = useCart()
  return (
    <div className="replica-shop">
      <h2>Shop</h2>
      <div className="replica-grid">
        {products.map(p => (
          <div key={p.id} className="replica-card">
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <div className="desc">{p.description ? p.description.slice(0,80) + (p.description.length>80 ? '…':'' ) : ''}</div>
            <p style={{color:'var(--muted)',marginTop:8}}>${Number(p.price).toFixed(2)}</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:8}}>
              <Link to={`/product/${p.id}`} className="btn">View</Link>
              <button className="btn" onClick={() => addToCart(p,1)} style={{background:'#0b6b61'}}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
