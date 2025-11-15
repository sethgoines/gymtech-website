import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  async function signIn(email, password){
    return signInWithEmailAndPassword(auth, email, password)
  }
  
  async function signUp(email, password){
    return createUserWithEmailAndPassword(auth, email, password)
  }
  
  async function signOut(){
    return firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
