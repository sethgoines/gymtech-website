import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }){
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('gymtech_cart')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('gymtech_cart', JSON.stringify(cart))
  }, [cart])

  function addToCart(product, qty = 1){
    setCart(prev => {
      const found = prev.find(p => p.id === product.id)
      if(found){
        return prev.map(p => p.id === product.id ? {...p, quantity: p.quantity + qty} : p)
      }
      return [...prev, {...product, quantity: qty}]
    })
  }

  function removeFromCart(productId){
    setCart(prev => prev.filter(p => p.id !== productId))
  }

  function updateQuantity(productId, qty){
    setCart(prev => prev.map(p => p.id === productId ? {...p, quantity: qty} : p))
  }

  function clearCart(){ setCart([]) }

  return (
    <CartContext.Provider value={{cart, addToCart, removeFromCart, updateQuantity, clearCart}}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(){
  const ctx = useContext(CartContext)
  if(!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
