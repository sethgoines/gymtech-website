## Deployment guide — GymTech Website

This document shows practical steps to deploy the Node server, host the static site, register Stripe webhooks, configure SMTP, and enable TLS.

Prerequisites:
- Docker (recommended) or a Node.js-capable host (Render, Fly.io, Cloud Run, DigitalOcean App Platform)
- A domain name and DNS control
- Stripe account
- SMTP provider (SendGrid, Mailgun, SES, etc.)
- Firebase project and service account if you want persistent Firestore

1) Prepare environment variables
- Copy `server/.env.example` to `server/.env` and fill values.
- Do NOT commit `server/.env` to git. Use your host's secret manager instead.

2) Build & run locally with Docker
- Build the image:
  docker compose build
- Start services:
  docker compose up
- Visit http://localhost:3000

3) Choose hosting
- Option A (easy): Render / Fly / DigitalOcean Apps — use Docker or directly deploy the repo and set env vars in the dashboard.
- Option B (container): Push Docker image to a registry (GitHub Container Registry, Docker Hub) and deploy container.
- Option C (GCP): Build image and deploy to Cloud Run. Configure secrets via Secret Manager.

4) Static frontend
- Option 1: Serve `dist/` from the Node server (the server will serve the static assets if present).
- Option 2 (recommended): Build the client and host on Vercel/Netlify/Cloudflare Pages for CDN + TLS. Set `VITE_API_URL` in client runtime or during build.

5) Stripe webhook registration
- In Stripe Dashboard > Developers > Webhooks > Add endpoint: `https://your-domain.com/webhook` and listen to `checkout.session.completed` (and any other events you want).
- Save the webhook secret (starts with `whsec_`) and set `STRIPE_WEBHOOK_SECRET` on your server environment.
- For local testing use the Stripe CLI: `stripe listen --forward-to http://localhost:3000/webhook` and copy the generated webhook secret to your local `.env`.

6) SMTP configuration
- Use SendGrid/Mailgun/SES. Create an API key or SMTP credentials.
- Populate `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in your host's secret store.
- Optionally route emails through provider templates for better deliverability.

7) Firebase / Firestore
- For production, create a Firebase project, enable Auth & Firestore, and generate a service account JSON from GCP IAM.
- Set `GOOGLE_APPLICATION_CREDENTIALS` in the server environment pointing to the uploaded JSON path or store the JSON string in a secret and write to disk at runtime.

8) DNS & TLS
- Create A or CNAME record pointing to your host. If using Vercel/Render, follow their DNS instructions.
- Enable TLS via provider (Render/Vercel do this automatically). For self-hosting, use Let's Encrypt and certbot or a managed load balancer.

9) Register webhook and smoke test
- With server live and `STRIPE_WEBHOOK_SECRET` set, create a Checkout session via the site, complete payment with a test card (4242 4242 4242 4242), and verify the webhook marks the order paid and an email is sent.

10) Monitoring
- Add logging/monitoring: provider logs, Sentry for errors, and alerting for failed webhooks or email send failures.

If you'd like, I can:
- Build & publish a Docker image to GHCR for you (requires a GitHub PAT in secrets).
- Create a Render/DigitalOcean app via API (requires API key and service id).
- Help you register the Stripe webhook if you provide the production domain and grant me temporary access (or I can provide exact CLI commands you should run).
