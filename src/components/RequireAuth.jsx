import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }){
  const { user, loading } = useAuth()
  const loc = useLocation()

  if(loading) return null // or a spinner
  if(!user) return <Navigate to="/signin" state={{ from: loc }} replace />
  return children
}
