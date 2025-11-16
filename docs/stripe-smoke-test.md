# Stripe smoke test (checkout -> webhook -> Firestore)

This document explains how to run a safe Stripe smoke test that verifies the Checkout session flow and that your webhook handler persists orders to Firestore.

Prerequisites
- Node 18+ on the machine running tests.
- Stripe CLI installed (recommended) for forwarding webhooks locally.
- Backend `create-checkout-session` and `webhook` endpoints deployed locally or reachable (we assume your server uses environment variables `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`).

Quick plan
1. Ensure your backend has `STRIPE_SECRET_KEY` (test key) and `STRIPE_WEBHOOK_SECRET` (from Stripe CLI or Stripe dashboard) set.
2. Start your backend server (or use the deployed preview).
3. If testing locally, run `stripe listen --forward-to localhost:3000/webhook` and copy the webhook signing secret it prints.
4. Export `STRIPE_WEBHOOK_SECRET` to your backend env and restart the backend so it uses the correct secret.
5. Use the helper script `scripts/create_test_checkout_session.js` to request a Checkout session from your backend; the script will print a URL.
6. Open the Checkout URL in a browser and complete a test payment using card number 4242 4242 4242 4242 (any future expiry and any CVC).
7. Stripe will emit `checkout.session.completed` to your webhook; confirm the backend logs show the webhook was processed and check Firestore for the new order document.

Expected Firestore document
- Collection: `orders`
- Document fields (sample):
  - userId: string|null
  - userEmail: string|null
  - items: array
  - createdAt: timestamp

Troubleshooting
- If the webhook fails with 400, verify `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen` or the deployed webhook signing secret.
- If Firestore writes fail, check Firebase project configuration and service account / rules.

Security
- Use Stripe test keys only. Never commit real secret keys.
