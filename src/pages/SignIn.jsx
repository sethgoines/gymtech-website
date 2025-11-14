import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignIn(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp, signOut } = useAuth()
  const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

  function validate(){
    if(!email) return 'Email is required.'
    // simple email check
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRe.test(email)) return 'Please enter a valid email address.'
    if(!password) return 'Password is required.'
    if(password.length < 6) return 'Password must be at least 6 characters.'
    return null
  }

  async function handleSignIn(e){
    e && e.preventDefault()
    const v = validate()
    if(v){ setFormError(v); return }
    setLoading(true)
    setMsg(null)
    setFormError(null)
    try{
      await signIn(email, password)
      setMsg('Signed in successfully.')
      // navigate to home after successful sign-in
      navigate('/', { replace: true })
    }catch(err){
      // map common firebase auth errors to friendlier messages
      const code = err?.code || ''
      let friendly = err.message
      if(code.includes('user-not-found')) friendly = 'No account found for that email.'
      else if(code.includes('wrong-password')) friendly = 'Incorrect password.'
      else if(code.includes('invalid-email')) friendly = 'Invalid email address.'
      setMsg(friendly)
    } finally { setLoading(false) }
  }

  async function handleSignUp(e){
    e && e.preventDefault()
    const v = validate()
    if(v){ setFormError(v); return }
    setLoading(true)
    setMsg(null)
    setFormError(null)
    try{
      await signUp(email, password)
      setMsg('Account created and signed in.')
      navigate('/', { replace: true })
    }catch(err){
      const code = err?.code || ''
      let friendly = err.message
      if(code.includes('email-already-in-use')) friendly = 'An account with that email already exists.'
      else if(code.includes('invalid-email')) friendly = 'Invalid email address.'
      setMsg(friendly)
    } finally { setLoading(false) }
  }

  async function handleSignOut(){
    await signOut()
    setMsg('Signed out')
  }

  return (
    <div style={{maxWidth:480}}>
      <h1>Sign in / Register</h1>
      <form className="card" onSubmit={handleSignIn} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%', padding:8, marginTop:6, marginBottom:12}} aria-required="true" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', padding:8, marginTop:6}} aria-required="true" />
        {formError && <div role="alert" style={{color:'red', marginTop:8}}>{formError}</div>}
        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button className="btn" type="submit" disabled={loading}> {loading ? 'Signing in...' : 'Sign in'}</button>
          <button type="button" onClick={handleSignUp} disabled={loading}> {loading ? 'Working...' : 'Create account'}</button>
          <button onClick={handleSignOut} type="button">Sign out</button>
        </div>
        {msg && <div style={{marginTop:8,color:'#6b7280'}}>{msg}</div>}
      </form>
      <div style={{marginTop:12}} className="card">
        {useEmulator ? (
          <>
            Using the Firebase Auth emulator for local testing. To auto-login use the seeded test user below, or run the emulator helper if it isn't running.
            <div style={{marginTop:8, display:'flex', gap:8}}>
              <button className="btn" type="button" onClick={()=>{ setEmail('test@local.test'); setPassword('Password123!'); setMsg('Test credentials filled') }}>Use test credentials</button>
              <button className="btn" type="button" onClick={()=>setMsg('If emulator is not running, start it with run-dev-emulator.cmd')}>How to start emulator</button>
            </div>
          </>
        ) : (
          <>Note: this requires Firebase configuration set in <code>.env</code> (see <code>.env.example</code>). Provide your Firebase config or enable the emulator.</>
        )}
      </div>
    </div>
  )
}
