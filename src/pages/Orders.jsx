import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getOrders, deleteLocalOrder, exportOrders } from '../lib/db'
import { Link } from 'react-router-dom'

export default function Orders(){
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load(){
      setLoadingOrders(true)
      try{
        const data = await getOrders(user ? user.uid : null)
        if(mounted) setOrders(data || [])
      }catch(e){
        console.error('Failed to load orders', e)
        if(mounted) setOrders([])
      }finally{
        if(mounted) setLoadingOrders(false)
      }
    }
    if(!loading) load()
    return ()=> { mounted = false }
  }, [user, loading])

  function handleDelete(id){
    const updated = deleteLocalOrder(id)
    setOrders(updated)
  }

  async function handleExport(){
    const json = await exportOrders(user ? user.uid : null)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleEmail(){
    setMessage(null)
    // Try server endpoint first if configured
    const server = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:4242'
    const adminSecret = import.meta.env.VITE_ADMIN_SECRET
    const payload = await exportOrders(user ? user.uid : null)

    if(!server){
      setMessage('No email server configured. Falling back to mail client.')
    }

    if(server){
      try{
        setSending(true)
        const headers = { 'Content-Type': 'application/json' }
        if(adminSecret) headers['x-admin-secret'] = adminSecret
        // If logged in, include ID token for server verification
        if(user){
          try{
            const token = await user.getIdToken()
            headers['Authorization'] = `Bearer ${token}`
          }catch(e){ console.warn('Failed to get ID token', e) }
        }

        const res = await fetch(`${server.replace(/\/$/,'')}/api/send-orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ format: 'json', orders: JSON.parse(payload) })
        })
        const data = await res.json()
        if(res.ok){
          setMessage('Email sent successfully')
        } else {
          setMessage(data && data.error ? `Failed: ${data.error}` : 'Failed to send email')
        }
      }catch(e){
        console.error('Email send failed', e)
        setMessage('Failed to send via server, falling back to mail client')
        // fallthrough to mailto fallback
      }finally{
        setSending(false)
      }
    }

    // mailto fallback: open user's email client with the orders in body (best-effort)
    try{
      const subject = encodeURIComponent('GymTech orders export')
      const body = encodeURIComponent(payload)
      const mailto = `mailto:${import.meta.env.VITE_ADMIN_EMAIL || ''}?subject=${subject}&body=${body}`
      window.location.href = mailto
    }catch(e){
      console.error('mailto fallback failed', e)
    }
  }

  return (
    <div>
      <h1>Orders</h1>
      <p><Link to="/">Back to shop</Link></p>
      <div style={{marginBottom:12, display:'flex', gap:8}}>
        <button onClick={handleExport} className="btn">Export orders</button>
        <button onClick={handleEmail} className="btn" disabled={sending}>{sending ? 'Sending…' : 'Email orders'}</button>
        {message && <div style={{marginLeft:8}}>{message}</div>}
      </div>

      {loadingOrders ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div>
          {orders.map(o => (
            <div key={o.id} style={{border:'1px solid #ddd', padding:12, marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div><strong>Order:</strong> {o.id}</div>
                <div><small>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</small></div>
              </div>
              <div style={{marginTop:8}}>
                <strong>Items:</strong>
                <ul>
                  {(o.items||[]).map((it,i)=> (
                    <li key={i}>{it.name} — {it.quantity||it.qty||1} × ${it.price}</li>
                  ))}
                </ul>
              </div>
              <div style={{marginTop:8}}>
                <strong>User:</strong> {o.userEmail || 'Guest'}
              </div>
              <div style={{marginTop:8}}>
                <button onClick={() => handleDelete(o.id)}>Delete local</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
