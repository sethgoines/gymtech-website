<#
PowerShell startup script: if GCP_SA_KEY env var is present, write it to a file and set GOOGLE_APPLICATION_CREDENTIALS.
Use this on Windows-based hosts or for local testing.
#>
param()

$secretsDir = $env:RUN_SECRETS_PATH
if (-not $secretsDir) { $secretsDir = "$env:TEMP\secrets" }
$saPath = $env:GOOGLE_APPLICATION_CREDENTIALS
if (-not $saPath) { $saPath = Join-Path $secretsDir 'gcp-service-account.json' }

if ($env:GCP_SA_KEY) {
    Write-Host "Writing GCP service account JSON to $saPath"
    New-Item -ItemType Directory -Force -Path (Split-Path $saPath) | Out-Null
    # Replace escaped newlines if present
    $content = $env:GCP_SA_KEY -replace '\\n', "`n"
    Set-Content -Path $saPath -Value $content -NoNewline
    $env:GOOGLE_APPLICATION_CREDENTIALS = $saPath
} else {
    Write-Host "GCP_SA_KEY not provided; proceeding without writing service account file"
}

Write-Host "Starting server: node index.js"
node index.js
