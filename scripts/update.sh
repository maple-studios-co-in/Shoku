#!/usr/bin/env bash
#
# Pull the latest code and redeploy (use after pushing changes to GitHub).
# Handles the multi-tenant migration safely and idempotently.
#   chmod +x scripts/update.sh
#   ./scripts/update.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/pista}"
APP_NAME="${APP_NAME:-pista}"
BASE_DOMAIN_DEFAULT="${BASE_DOMAIN_DEFAULT:-pista.maplestudios.co.in}"
DEFAULT_TENANT_SLUG="${DEFAULT_TENANT_SLUG:-cbtl}"

cd "$APP_DIR"

echo "↻ Pulling latest…"
git pull --ff-only

echo "📦 Installing deps…"
npm ci

# Ensure multi-tenant env vars exist (added once, only if missing).
if ! grep -q '^BASE_DOMAIN=' .env 2>/dev/null; then
  echo "✎ Adding multi-tenant env vars to .env"
  cat >> .env <<EOF

# Multi-tenant
BASE_DOMAIN="$BASE_DOMAIN_DEFAULT"
NEXT_PUBLIC_BASE_DOMAIN="$BASE_DOMAIN_DEFAULT"
DEFAULT_TENANT_SLUG="$DEFAULT_TENANT_SLUG"
EOF
fi

# Cross-subdomain login cookie (added once if missing). Needs HTTPS.
if ! grep -q '^COOKIE_DOMAIN=' .env 2>/dev/null; then
  echo "✎ Adding COOKIE_DOMAIN to .env"
  echo "COOKIE_DOMAIN=\".$BASE_DOMAIN_DEFAULT\"" >> .env
fi

echo "⛁ Backing up database…"
[ -f prisma/dev.db ] && cp prisma/dev.db "prisma/dev.db.bak-$(date +%Y%m%d%H%M%S)" || true

echo "⛁ Applying schema…"
# --accept-data-loss is required because SQLite rebuilds tables for some additive
# changes (e.g. adding a unique column); data is preserved. A timestamped backup
# is taken above just in case.
npx prisma db push --skip-generate --accept-data-loss

# Idempotent: creates the platform superadmin + default tenant and backfills
# tenantId on any rows that don't have one yet. Safe to run on every deploy.
echo "⛁ Ensuring multi-tenant migration…"
node prisma/migrate-to-multitenant.js

echo "🏗  Building…"
npm run build

echo "🚀 Restarting…"
pm2 restart "$APP_NAME" --update-env

echo "✓ Updated. Check: pm2 logs $APP_NAME  |  https://$BASE_DOMAIN_DEFAULT/super"
