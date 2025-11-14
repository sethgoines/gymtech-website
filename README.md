# GymTech (starter)

This repo is a starter React + Vite e-commerce skeleton for a GymTech clothing store. It includes:

- React + Vite project scaffold
- React Router pages (Home, Shop, Product, Cart, Sign in, Checkout)
- Cart state persisted in localStorage (`CartContext`)
- Framer Motion animations
- Mock checkout flow and Sign-in placeholders
- Instructions and `.env.example` to wire Stripe (payments) and Firebase (auth)

What I implemented
- Pages: Home, Shop, Product, Cart, SignIn, Checkout, About, Contact
- Components: NavBar
- Context: CartContext with add/remove/update/clear
- Data: sample `src/data/products.js` (replace with your catalog)

Getting started (local)
1. Install dependencies

```powershell
cd "c:\Users\Sethg\Desktop\GymTech-Website"
npm install
```

2. Start dev server

```powershell
npm run dev
```

Open the Local URL printed by Vite (usually http://localhost:5173) in your browser. To start the dev server and automatically open your browser, run:

```powershell
npm run dev:open
```

Enabling real Sign-in and Payments
- Sign-in: integrate Firebase Auth. Use `VITE_FIREBASE_*` env vars (see `.env.example`) and initialize Firebase in a new `src/firebase.js` file. Replace the mock SignIn page with calls to `signInWithEmailAndPassword` or OAuth providers.

- Payments: implement a server endpoint to create a Stripe Checkout Session or PaymentIntent. Use `@stripe/stripe-js` and `@stripe/react-stripe-js` on the client to collect payment details or redirect to Checkout. Never expose your Stripe secret key in the client.

Next suggested improvements (I can implement any of these):
- Product detail images + gallery
- Server for product catalog and Stripe checkout sessions
- Firebase integration for user accounts and order history
- UI polish: responsive layout, Tailwind or styled-components, product filters
- Tests for cart logic

If you want, I can now:
- Wire Firebase Auth with a small `src/firebase.js` and update SignIn to sign in real users (you'll need to provide config values or let me create a `.env` template), or
- Add a minimal Node/Express server that creates Stripe Checkout sessions (mockable) and connect the client to it.

Which next step do you want me to implement first?

## Enabling Firebase Auth (client)

1. Create a Firebase project at https://console.firebase.google.com and enable Email/Password sign-in (and any providers you want).
2. Copy the firebase config values into your project `.env` using keys from `.env.example` (rename `.env.example` to `.env` and fill values).
3. Start the dev server (`npm run dev`). The Sign in / Register page will use Firebase Auth to create and sign in users.

### Using the Firebase Auth Emulator (no account required)

If you want to test sign-up and sign-in without creating a Firebase project, you can run the Firebase Auth emulator locally.

1. Enable the emulator in development by creating a `.env.local` file at the project root with:

```properties
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=demo
```

2. Start the emulator and your dev server. There are two options:

- Run emulator and dev server together (may require two terminals if your shell blocks background commands):

```powershell
# Terminal 1
npm run emulator:start

# Terminal 2 (after emulator is running)
npm run dev:open
```

- Or run both in one command (uses concurrently):

```powershell
npm run dev:emulator
```

3. Seed a test user (run after the emulator is running):

```powershell
npm run seed:emulator
```

Default seeded test credentials are:

- Email: `test@local.test`
- Password: `Password123!`

Open the Sign In page and use those credentials to sign in. The app is configured to connect to the Auth emulator when `VITE_USE_FIREBASE_EMULATOR=true`.

## Enabling Stripe Checkout (server + client)

1. Create a Stripe account and get your secret key.
2. Copy `server/.env.example` to `server/.env` and set `STRIPE_SECRET_KEY`.
3. From the project root run:

```powershell
cd server
npm install
npm start
```

4. Keep the server running and use the site Checkout flow (Pay now). The Checkout page will POST the cart to the server which creates a Stripe Checkout session and redirects the browser to Stripe.

Notes:
- The server runs on port 4242 by default and allows requests from the Vite dev server at `http://localhost:5173`.
- For production you'll deploy the server to a secure environment and use your live Stripe keys. Never commit your secret keys to source control.

## Sending orders by email (secure)

The project includes a small server endpoint to email an orders export (`POST /api/send-orders`). The endpoint expects a JSON body with an `orders` array and will attach the export as a file. For security, the endpoint accepts either:

- An `x-admin-secret` header matching `ADMIN_SECRET` in `server/.env` (legacy), or
- A Firebase ID token sent as `Authorization: Bearer <idToken>` from an authenticated admin user (recommended).

To enable it:

1. In `server/.env` set your SMTP credentials (or use any SMTP provider):

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
EMAIL_FROM="GymTech <noreply@example.com>"
ADMIN_EMAIL=admin@example.com
ADMIN_SECRET=replace-with-a-secret-for-server
```

2. From the project root run:

```powershell
cd server
npm install
npm start
```

3. The Orders page in the app has an "Email orders" button which will POST the orders to the server. For local development you can set `VITE_EMAIL_SERVER_URL` and `VITE_ADMIN_SECRET` in your client `.env` (see `.env.example`). If a user is signed-in the client will include their Firebase ID token in `Authorization` so the server can verify admin rights. If no server is configured the app will fall back to opening the user's mail client with the orders JSON in the message body.

Security note: Do not embed admin secrets or SMTP credentials in client-side code for production. Use a secure server-side secret store and enforce authentication/authorization on the server.

## Run everything persistently (keep processes running after you close terminals)

If you want the Node server and the Firebase emulators to keep running after you close terminals, this repo includes PM2 support. PM2 will daemonize the processes so they continue running in the background.

1) Install PM2 locally (we added it to devDependencies) or globally:

```powershell
npm install
npx pm2 -v   # verify pm2 is available
```

2) Start the managed processes (server + emulator):

```powershell
# start both apps defined in ecosystem.config.js
npx pm2 start ecosystem.config.js
# save process list so pm2 resurrects them after a machine reboot (optional)
npx pm2 save
```

3) Check status, stop, restart:

```powershell
npx pm2 ls
npx pm2 stop ecosystem.config.js
npx pm2 restart ecosystem.config.js
```

Notes:
- The emulator process will attempt to start the Firebase emulators using `npx firebase emulators:start`. Ensure `firebase-tools` is installed (we added it to devDependencies) and Java is on PATH for the Firestore emulator.
 - The emulator process will attempt to start the Firebase emulators using `npx firebase emulators:start`. Ensure `firebase-tools` is installed (we added it to devDependencies) and Java is on PATH for the Firestore emulator.
 - Emulator data can now be persisted between runs by using the `FIREBASE_EMULATOR_DATA` env var (defaults to `firebase_emulator_data`) and the wrapper script will pass `--import`/`--export-on-exit` to the emulator.
- PM2 runs Node processes in the background; to remove them, run `npx pm2 delete ecosystem.config.js`.
- For a Windows production setup you may prefer to register the Node server as a Windows service (e.g., using NSSM) or deploy to a cloud host. PM2 is a convenient option for local persistent processes.

### Auto-start on login (Windows Scheduled Task)

If you want PM2 to resurrect processes automatically at user logon, you can register a Scheduled Task that runs `npx pm2 resurrect`.

We included two helper scripts in `scripts/`:

- `scripts/register-pm2-scheduledtask.ps1` — register a Scheduled Task named "GymTech PM2" which attempts to resurrect PM2 processes or start them if missing. You may need to run this as Administrator.
- `scripts/unregister-pm2-scheduledtask.ps1` — remove the scheduled task.

Usage:

```powershell
# register (may require admin privileges)
.
\scripts\register-pm2-scheduledtask.ps1

# To remove later
.
\scripts\unregister-pm2-scheduledtask.ps1
```

Security note: scheduled tasks run commands on login; ensure the commands and environment are safe and your secrets are stored only in `server/.env` and not in the scheduled task command line.

## Editing content (how to customize the store)

Here's a short, practical guide to the files you will change to customize products, images, copy and styles.

- Products (catalog): `src/data/products.js`
	- Each product is an object: `{ id, name, price, image, description }`.
	- To add a product, create a new object with a unique `id` (string) and valid `price` (number).
	- Example:

		```js
		{
			id: '4',
			name: 'GymTech Runner Jacket',
			price: 79.99,
			image: '/src/assets/jacket.jpg',
			description: 'Windproof running jacket.'
		}
		```

- Product images:
	- Put images in `src/assets/` (create the folder if it doesn't exist) or use remote URLs.
	- If you use local images, import or reference them from components. Example in a component:

		```jsx
		import jacket from '../assets/jacket.jpg'
		<img src={jacket} alt="Jacket" />
		```

- Page copy and layouts:
	- `src/pages/Home.jsx`, `src/pages/Shop.jsx`, `src/pages/Product.jsx`, `src/pages/Cart.jsx`, `src/pages/SignIn.jsx`, `src/pages/Checkout.jsx` contain the page markup. Edit text and structure there.

- Site title and header:
	- Change the brand text "GymTech" in `src/components/NavBar.jsx`.

- Styling and theme:
	- Base CSS lives in `src/index.css` — adjust colors, spacing, fonts here.
	- If you'd prefer a utility-first approach, we can add Tailwind CSS (I can scaffold this for you).

- Cart logic:
	- `src/context/CartContext.jsx` contains cart operations (addToCart, removeFromCart, updateQuantity, clearCart) and persists the cart to `localStorage`.
	- If you want server-side orders, we'll replace local persistence with API calls to save orders for signed-in users.

- Running locally during edits:
	- After changing files, the dev server auto-reloads. Use the dev server URL printed by Vite (usually `http://localhost:5173`).

If you'd like, I can also:
- Convert the product data into a JSON file and add a small admin UI to manage products, or
- Connect a headless CMS (Sanity, Contentful) to manage products without code.

Tell me which customization you want and I will implement it next.

## One-click local run (Windows)

I added a small helper to open the Firebase emulator, seed the test user, and start the dev server in separate windows.

From a Command Prompt (cmd.exe) run:

```cmd
cd C:\Users\Sethg\Desktop\GymTech-Website
run-dev-emulator.cmd
```

Or from PowerShell (start as administrator if execution policies block scripts):

```powershell
cd "C:\Users\Sethg\Desktop\GymTech-Website"
& .\scripts\run-dev-emulator.ps1
```

This will open three terminal windows:
- Emulator window (shows emulator logs)
- Seeder window (waits for emulator and seeds a test user)
- Dev server window (starts Vite and opens the browser)

If any window shows errors, copy and paste the console output here and I'll help debug.
