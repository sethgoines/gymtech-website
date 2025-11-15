import React from 'react'
import './replica.css'
import { products } from '../data/products'
import { Link } from 'react-router-dom'

export default function ReplicaShop(){
  return (
    <div className="replica-shop">
      <h2>Shop</h2>
      <div className="replica-grid">
        {products.map(p => (
          <div key={p.id} className="replica-card">
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p>${p.price}</p>
            <Link to={`/product/${p.id}`} className="btn">View</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
