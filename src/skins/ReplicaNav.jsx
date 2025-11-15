import React from 'react'
import { Link } from 'react-router-dom'
import './replica.css'
import './replica-extra.css'

export default function ReplicaNav(){
  return (
    <header className="replica-nav">
      <div className="replica-nav-inner">
        <h1 className="brand">GymTech</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/replica/shop">Replica Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
