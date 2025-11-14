import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'

export default function Product(){
  const { id } = useParams()
  const p = products.find(x => x.id === id)
  const { addToCart } = useCart()
  if(!p) return <div>Product not found</div>
  return (
    <div>
      <h1>{p.name}</h1>
      <div style={{display:'flex',gap:20}}>
        <div style={{width:360}} className="product-image">Image</div>
        <div>
          <p style={{color:'#6b7280'}}>${p.price.toFixed(2)}</p>
          <p>{p.description}</p>
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={() => addToCart(p,1)}>Add to cart</button>
            <Link to="/checkout">Buy now</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
