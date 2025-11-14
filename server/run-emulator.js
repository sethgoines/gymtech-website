/**
 * Wrapper to start the Firebase emulators via npx so a process manager (pm2)
 * can keep them running on Windows. It spawns `npx firebase emulators:start`.
 */
const { spawn } = require('child_process')

function startEmulator(){
  const importDir = process.env.FIREBASE_EMULATOR_DATA || 'firebase_emulator_data'
  const args = ['firebase', 'emulators:start', '--only', 'auth,firestore', '--project', process.env.FIREBASE_PROJECT_ID || 'demo', '--import', importDir, '--export-on-exit']
  console.log('Starting Firebase emulators with:', 'npx', args.join(' '))
  const child = spawn('npx', args, { stdio: 'inherit', shell: true, env: process.env })

  child.on('close', (code, signal) => {
    console.log(`Emulator process exited with code=${code} signal=${signal}`)
    // keep process alive so pm2 can restart it
    process.exit(code || 0)
  })

  child.on('error', (err) => {
    console.error('Failed to start emulator process', err)
    process.exit(1)
  })
}

startEmulator()
