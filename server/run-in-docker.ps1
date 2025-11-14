<#
Helper to run the Node server locally in Docker using the repo Dockerfile.
Usage:
  .\server\run-in-docker.ps1  # builds image and runs container

Expectations:
- Fill `server/.env` with local values before running (copy from .env.example)
#>

param(
  [string]$ImageName = "gymtech-website:local",
  [int]$Port = 3000
)

Write-Host "Building Docker image: $ImageName"
docker build -t $ImageName .

Write-Host "Running container on port $Port (removing any previous container named gymtech-local)"
if (docker ps -a -q -f name=gymtech-local) {
  docker rm -f gymtech-local | Out-Null
}

docker run --name gymtech-local -p ${Port}:3000 --env-file ./server/.env -v ${PWD}:/usr/src/app:cached $ImageName
