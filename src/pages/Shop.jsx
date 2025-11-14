import React from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import db from '../lib/db'

export default function Shop(){
  const { addToCart } = useCart()
  const [items, setItems] = useState(products)

  useEffect(() => {
    let mounted = true
    db.getProducts().then(data => { if (mounted) setItems(data) }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <h1>Shop</h1>
      <div className="product-grid">
        {items.map(p => (
          <div key={p.id} className="card">
            <div className="product-image">Image</div>
            <h3>{p.name}</h3>
            <p style={{color:'#6b7280'}}>${Number(p.price).toFixed(2)}</p>
            <div style={{display:'flex',gap:8}}>
              <Link to={`/product/${p.id}`}>View</Link>
              <button className="btn" onClick={() => addToCart(p,1)}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
