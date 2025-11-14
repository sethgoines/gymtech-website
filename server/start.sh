#!/usr/bin/env sh
# Startup script for Docker/Cloud Run/Render
# If GCP_SA_KEY (JSON) is provided as an env var, write it to a file and set GOOGLE_APPLICATION_CREDENTIALS

set -e

SECRETS_DIR=/run/secrets
SA_PATH=${GOOGLE_APPLICATION_CREDENTIALS:-"${SECRETS_DIR}/gcp-service-account.json"}

if [ -n "$GCP_SA_KEY" ]; then
  echo "Writing GCP service account JSON to $SA_PATH"
  mkdir -p "$(dirname "$SA_PATH")"
  # If the env var contains JSON escaped newlines, try to unescape; otherwise write raw
  echo "$GCP_SA_KEY" | sed 's/\\n/\n/g' > "$SA_PATH"
  export GOOGLE_APPLICATION_CREDENTIALS="$SA_PATH"
else
  echo "GCP_SA_KEY not provided; proceeding without writing service account file"
fi

echo "Starting server: node index.js"
node index.js
