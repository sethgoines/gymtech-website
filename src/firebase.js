import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Build firebase config with sensible fallbacks when running the local emulator.
const isEmu = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (isEmu ? 'fake-api-key' : undefined),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (isEmu ? 'localhost' : undefined),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (isEmu ? 'demo' : undefined),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (isEmu ? '' : undefined),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isEmu ? '' : undefined),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (isEmu ? '1:000000000000:web:000000000000' : undefined)
}

// Initialize app. The emulator accepts arbitrary API keys, so we provide safe defaults when
// VITE_USE_FIREBASE_EMULATOR=true to avoid `auth/invalid-api-key` errors in the browser.
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// If running locally with the emulator, connect clients to the emulator
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Auth emulator default port
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    // If you also use Firestore emulator, uncomment and adjust the host/port below
  connectFirestoreEmulator(db, 'localhost', 8080)
    // console.info('Connected Firebase clients to emulator')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Could not connect to Firebase emulator:', e)
  }
}
export default app
