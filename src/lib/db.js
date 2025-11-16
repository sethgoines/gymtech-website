import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function saveOrder(payload){
  // payload: { userId, userEmail, items }
  if(!db) return Promise.reject(new Error('No firestore instance'))
  const ordersCol = collection(db, 'orders')
  const doc = {
    ...payload,
    createdAt: serverTimestamp()
  }
  return await addDoc(ordersCol, doc)
}

export default { saveOrder }
