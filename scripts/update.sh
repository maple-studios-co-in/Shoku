#!/usr/bin/env bash
#
# Pull the latest code and redeploy (use after pushing changes to GitHub).
#   chmod +x scripts/update.sh
#   ./scripts/update.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/pista}"
APP_NAME="${APP_NAME:-pista}"

cd "$APP_DIR"
echo "↻ Pulling latest…"
git pull --ff-only

npm ci
npx prisma db push --skip-generate   # apply schema changes if any (keeps data)
npm run build

pm2 restart "$APP_NAME" --update-env
echo "✓ Updated. Check: pm2 logs $APP_NAME"
