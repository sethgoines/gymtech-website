<#
Run a guided Stripe smoke test locally.

This script prints exact steps and can optionally run the helper that requests a Checkout session from your backend.

Usage:
  1. Open PowerShell in the project root.
  2. Run: .\scripts\run_stripe_smoke_test.ps1

Notes:
 - This script does NOT contain secrets. You'll be prompted to copy/paste the Stripe webhook secret from `stripe listen`.
 - Make sure your backend is running at http://localhost:3000 and exposes /create-checkout-session and /webhook.
#>

Write-Host "=== Stripe Smoke Test Helper ===" -ForegroundColor Cyan

Write-Host "Step 1: Start your backend (in a separate terminal). Example:" -ForegroundColor Yellow
Write-Host "  cd .\server" -ForegroundColor Green
Write-Host "  npm install" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Green

Write-Host "\nStep 2: In a new terminal, run Stripe CLI to forward webhooks and copy the signing secret." -ForegroundColor Yellow
Write-Host "  stripe login" -ForegroundColor Green
Write-Host "  stripe listen --forward-to http://localhost:3000/webhook" -ForegroundColor Green
Write-Host "Copy the 'Webhook signing secret: whsec_...' value printed by stripe listen." -ForegroundColor Magenta

$whsec = Read-Host -Prompt "Paste the webhook signing secret (whsec_...) here (or press Enter to skip setting env)"
if ($whsec -ne "") {
  Write-Host "Exporting STRIPE_WEBHOOK_SECRET for the current session..." -ForegroundColor Green
  $env:STRIPE_WEBHOOK_SECRET = $whsec
  Write-Host "Remember to restart your backend if it reads env at startup." -ForegroundColor Yellow
}

Write-Host "\nStep 3: Create a Checkout session via helper script." -ForegroundColor Yellow
Write-Host "This will call your backend at http://localhost:3000/create-checkout-session and print a Checkout URL." -ForegroundColor Green

$run = Read-Host -Prompt "Run helper now? (y/N)"
if ($run -eq 'y' -or $run -eq 'Y') {
  if (-not (Test-Path .\scripts\create_test_checkout_session.js)) {
    Write-Host "Helper script not found: scripts/create_test_checkout_session.js" -ForegroundColor Red
    exit 1
  }
  $env:BACKEND_URL = Read-Host -Prompt "Backend URL (default http://localhost:3000)"
  if ($env:BACKEND_URL -eq "") { $env:BACKEND_URL = "http://localhost:3000" }
  Write-Host "Calling backend at $env:BACKEND_URL/create-checkout-session ..." -ForegroundColor Green
  node .\scripts\create_test_checkout_session.js
  Write-Host "If a Checkout URL was printed, open it in a browser and complete the test payment using card 4242 4242 4242 4242" -ForegroundColor Magenta
} else {
  Write-Host "Skipped running helper. You can run it manually:" -ForegroundColor Yellow
  Write-Host "  $env:BACKEND_URL=http://localhost:3000; node .\scripts\create_test_checkout_session.js" -ForegroundColor Green
}

Write-Host "\nStep 4: Verify" -ForegroundColor Yellow
Write-Host " - Watch stripe CLI output for webhook delivery to /webhook" -ForegroundColor Green
Write-Host " - Check backend logs for successful order save" -ForegroundColor Green
Write-Host " - Open Firebase console -> Firestore -> orders and confirm a new document exists" -ForegroundColor Green

Write-Host "\nSecurity reminder: use Stripe test keys only. Revoke any temporary secrets after testing." -ForegroundColor Cyan
