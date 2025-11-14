const fs = require('fs')
const path = require('path')
const admin = require('./admin')

const useFirestore = !!(process.env.FIREBASE_PROJECT_ID || process.env.USE_FIRESTORE_EMULATOR)

async function saveOrder(order){
  if(useFirestore){
    try{
      const db = admin.firestore()
      const doc = await db.collection('orders').add(order)
      return { id: doc.id }
    }catch(e){
      console.warn('Failed to save order to Firestore, falling back to file', e)
    }
  }

  // fallback: write to local JSON file
  const file = path.join(__dirname, '..', 'data', 'local-orders.json')
  let arr = []
  try { arr = JSON.parse(fs.readFileSync(file,'utf8')||'[]') } catch (e) {}
  const id = `local-${Date.now()}`
  arr.push({ id, ...order })
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(arr, null, 2))
  return { id }
}

async function markOrderPaid(orderId, metadata){
  if(useFirestore){
    try{
      const db = admin.firestore()
      const ref = db.collection('orders').doc(orderId)
      await ref.set({ paid: true, paidAt: new Date(), ...metadata }, { merge: true })
      return true
    }catch(e){
      console.warn('Failed to mark order paid in Firestore', e)
    }
  }

  // fallback: update local file
  const file = path.join(__dirname, '..', 'data', 'local-orders.json')
  try{
    const arr = JSON.parse(fs.readFileSync(file,'utf8')||'[]')
    const idx = arr.findIndex(o => o.id === orderId)
    if(idx !== -1){
      arr[idx] = { ...arr[idx], paid: true, paidAt: new Date(), ...metadata }
      fs.writeFileSync(file, JSON.stringify(arr, null, 2))
      return true
    }
  }catch(e){
    console.warn('Failed to update local orders file', e)
  }
  return false
}

async function isEventProcessed(eventId){
  if(useFirestore){
    try{
      const db = admin.firestore()
      const doc = await db.collection('stripe_events').doc(eventId).get()
      return doc.exists
    }catch(e){
      console.warn('isEventProcessed Firestore check failed', e)
    }
  }

  const file = path.join(__dirname, '..', 'data', 'processed-events.json')
  try{
    const arr = JSON.parse(fs.readFileSync(file,'utf8')||'[]')
    return arr.includes(eventId)
  }catch(e){
    return false
  }
}

async function markEventProcessed(eventId){
  if(useFirestore){
    try{
      const db = admin.firestore()
      await db.collection('stripe_events').doc(eventId).set({ processedAt: new Date() })
      return true
    }catch(e){
      console.warn('markEventProcessed Firestore write failed', e)
    }
  }

  const file = path.join(__dirname, '..', 'data', 'processed-events.json')
  try{
    let arr = []
    try{ arr = JSON.parse(fs.readFileSync(file,'utf8')||'[]') }catch(_){}
    if(!arr.includes(eventId)) arr.push(eventId)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(arr, null, 2))
    return true
  }catch(e){
    console.warn('markEventProcessed local write failed', e)
    return false
  }
}

module.exports = { saveOrder, markOrderPaid, isEventProcessed, markEventProcessed }

