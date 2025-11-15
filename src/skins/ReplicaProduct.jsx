import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'
import './replica.css'

export default function ReplicaProduct(){
  const { id } = useParams()
  const p = products.find(x => x.id === id)
  const { addToCart } = useCart()
  if(!p) return <div className="replica-product"><div>Product not found</div></div>
  return (
    <div className="replica-product">
      <div>
        <img className="image" src={p.image} alt={p.name} />
      </div>
      <aside>
        <h1>{p.name}</h1>
        <div className="price">${Number(p.price).toFixed(2)}</div>
        <p style={{color:'var(--muted)'}}>{p.description}</p>
        <div style={{marginTop:12,display:'flex',gap:8}}>
          <button className="btn" onClick={() => addToCart(p,1)}>Add to cart</button>
          <Link to="/checkout">Buy now</Link>
        </div>
      </aside>
    </div>
  )
}
