import React from 'react'
import { Link } from 'react-router-dom'
import './replica.css'

export default function ReplicaHome(){
  return (
    <div className="replica-hero">
      <div className="replica-hero-inner">
        <h2>Welcome to GymTech</h2>
        <p>Quality fitness gear — crafted for performance.</p>
        <div className="hero-image" aria-hidden="true"></div>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Link className="btn" to="/replica/shop">Shop Now</Link>
          <Link to="/replica/about" style={{alignSelf:'center',color:'#065f52'}}>Our Story</Link>
        </div>
        <div style={{marginTop:6,color:'var(--muted)',fontSize:14}}>Free shipping over $75 • Easy returns</div>
      </div>
    </div>
  )
}
