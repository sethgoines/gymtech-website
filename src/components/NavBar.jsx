import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function NavBar(){
  const { cart } = useCart()
  const count = cart.reduce((s, i) => s + i.quantity, 0)
  const { user, signOut } = useAuth()

  return (
    <header>
      <nav className="nav">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link to="/" style={{fontWeight:700,fontSize:18}}>GymTech</Link>
          <div className="links">
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {user ? (
            <>
              <span style={{color:'#374151'}}>Hi, {user.email}</span>
              <button onClick={() => signOut()} style={{background:'transparent',border:'none',cursor:'pointer'}}>Sign out</button>
            </>
          ) : (
            <NavLink to="/signin">Sign in</NavLink>
          )}
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/cart" style={{position:'relative'}}>
            <span>Cart</span>
            {count>0 && (
              <span style={{position:'absolute', top:-6, right:-18, background:'#ef4444', color:'white', borderRadius:999, padding:'2px 6px', fontSize:12}}>{count}</span>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  )
}
