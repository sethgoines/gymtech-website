// Lightweight firebase-admin initializer for server
const admin = require('firebase-admin')

function initAdmin(){
  if (admin.apps && admin.apps.length) return admin

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'demo'
  try {
    // If GOOGLE_APPLICATION_CREDENTIALS is set, admin will pick it up
    admin.initializeApp({ projectId })
  } catch (e) {
    try {
      // fallback: initialize without args
      admin.initializeApp()
    } catch (err) {
      // ignore if already initialized
    }
  }

  return admin
}

module.exports = initAdmin()
