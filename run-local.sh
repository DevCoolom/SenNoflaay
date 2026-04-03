#!/usr/bin/env bash
# macOS / Linux helper for starting the app with one command
# Usage: ./run-local.sh

set -euo pipefail

echo "\n=== SenNoflaay Local Dev Helper ===\n"

# copy example env if necessary
if [ ! -f .env ]; then
  echo "Creating .env from .env.example (you can edit it afterward)"
  cp .env.example .env
  echo "# REMEMBER: provide SUPABASE_URL and SUPABASE_SERVICE_KEY in .env" >> .env
fi

# install dependencies
if [ ! -d node_modules ]; then
  echo "Installing npm dependencies..."
  npm install
else
  echo "Dependencies appear installed; skip npm install"
fi

# start development server
echo "\nStarting server (use CTRL+C to stop)...\n"
npm run dev
