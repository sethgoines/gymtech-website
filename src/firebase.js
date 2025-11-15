import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const isEmu = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (isEmu ? 'fake-api-key' : undefined),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (isEmu ? 'localhost' : undefined),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (isEmu ? 'demo' : undefined),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (isEmu ? '' : undefined),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isEmu ? '' : undefined),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (isEmu ? '1:000000000000:web:000000000000' : undefined)
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
