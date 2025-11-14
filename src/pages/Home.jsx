import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home(){
  return (
    <div>
      <motion.section initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}} className="card">
        <h1 style={{margin:0}}>Welcome to GymTech</h1>
        <p style={{color:'#6b7280'}}>Quality training wear built for performance and comfort.</p>
        <Link to="/shop" className="btn">Shop Now</Link>
      </motion.section>

      <section style={{marginTop:20}}>
        <h2>Featured</h2>
        <div style={{display:'flex',gap:12}}>
          <div className="card" style={{flex:1}}>New arrivals — clean designs, high performance.</div>
          <div className="card" style={{flex:1}}>Sustainably sourced fabrics.</div>
        </div>
      </section>
    </div>
  )
}
