import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import CartPage from './pages/Cart'
import SignIn from './pages/SignIn'
import Checkout from './pages/Checkout'
import RequireAuth from './components/RequireAuth'
import Orders from './pages/Orders'
import { CartProvider } from './context/CartContext'
import OrderHandler from './components/OrderHandler'

export default function App() {
  return (
    <CartProvider>
      <NavBar />
      <OrderHandler />
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={<PageWrapper><Home /></PageWrapper>}
          />
          <Route
            path="/shop"
            element={<PageWrapper><Shop /></PageWrapper>}
          />
          <Route
            path="/product/:id"
            element={<PageWrapper><Product /></PageWrapper>}
          />
          <Route
            path="/cart"
            element={<PageWrapper><CartPage /></PageWrapper>}
          />
          <Route
            path="/signin"
            element={<PageWrapper><SignIn /></PageWrapper>}
          />
          <Route
            path="/orders"
            element={<PageWrapper><Orders /></PageWrapper>}
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <PageWrapper><Checkout /></PageWrapper>
              </RequireAuth>
            }
          />
        </Routes>
      </AnimatePresence>
    </CartProvider>
  )
}

function PageWrapper({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}
    >
      {children}
    </motion.main>
  )
}
