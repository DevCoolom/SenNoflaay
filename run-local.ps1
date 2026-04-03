# PowerShell helper for running the app on Windows
# Usage: Open PowerShell in workspace and run: .\run-local.ps1

Set-StrictMode -Version Latest

Write-Host "`n=== SenNoflaay Local Dev Helper (Windows) ===`n"

# copy example env if necessary
if (-Not (Test-Path -Path .env)) {
    Write-Host "Creating .env from .env.example (you can edit it afterward)"
    Copy-Item -Path .env.example -Destination .env
    Add-Content -Path .env -Value "# REMEMBER: provide SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
}

# install dependencies
if (-Not (Test-Path -Path node_modules)) {
    Write-Host "Installing npm dependencies..."
    npm install
} else {
    Write-Host "Dependencies appear installed; skipping npm install"
}

# start development server
Write-Host "`nStarting server (use Ctrl+C or close window to stop)...`n"
npm run dev
