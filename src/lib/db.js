import { db } from '../firebase'
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

export async function getProducts() {
  if (useEmulator) {
    try {
      const { getDocs, collection } = await import('firebase/firestore')
      const snapshot = await getDocs(collection(db, 'products'))
      const results = []
      snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }))
      return results
    } catch (e) {
      // If Firestore isn't available, fall back to local data
      // eslint-disable-next-line no-console
      console.warn('Failed to read products from Firestore emulator, falling back to local data', e)
    }
  }

  // Local fallback
  try {
    const mod = await import('../data/products')
    return mod.products || []
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load local products', e)
    return []
  }
}

export async function saveOrder(order) {
  if (useEmulator) {
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      const docRef = await addDoc(collection(db, 'orders'), { ...order, createdAt: serverTimestamp() })
      return { id: docRef.id }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to write order to Firestore emulator, falling back to local storage', e)
    }
  }

  // Local fallback: persist orders in localStorage
  try {
    const key = 'gymtech_orders'
    const raw = localStorage.getItem(key) || '[]'
    const arr = JSON.parse(raw)
    const id = `local-${Date.now()}`
    arr.push({ id, ...order, createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(arr))
    return { id }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to save order locally', e)
    throw e
  }
}

export default { getProducts, saveOrder }

export async function getOrders(userId = null) {
  if (useEmulator) {
    try {
      const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore')
      const q = userId
        ? query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
        : query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.warn('getOrders: Firestore unavailable, falling back to localStorage', e)
    }
  }

  // Local fallback
  try {
    const orders = JSON.parse(localStorage.getItem('gymtech_orders') || '[]')
    return userId ? orders.filter(o => o.userId === userId) : orders
  } catch (e) {
    console.error('Failed to read orders from localStorage', e)
    return []
  }
}

export function deleteLocalOrder(orderId) {
  try {
    const key = 'gymtech_orders'
    const arr = JSON.parse(localStorage.getItem(key) || '[]')
    const filtered = arr.filter(o => o.id !== orderId)
    localStorage.setItem(key, JSON.stringify(filtered))
    return filtered
  } catch (e) {
    console.error('Failed to delete local order', e)
    return []
  }
}

export async function exportOrders(userId = null) {
  const orders = await getOrders(userId)
  return JSON.stringify(orders, null, 2)
}
