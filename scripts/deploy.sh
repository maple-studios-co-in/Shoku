#!/usr/bin/env bash
#
# One-shot deploy for Pista on an Ubuntu VPS (Nginx + PM2 + Let's Encrypt).
# Safe to re-run: clones or updates, preserves the database, and only creates
# the Nginx site / SSL cert if they don't exist yet.
#
# Usage:
#   chmod +x scripts/deploy.sh
#   DOMAIN=pista.maplestudios.co.in ./scripts/deploy.sh
#
set -euo pipefail

# ---------- config (override via env) ----------
REPO="${REPO:-https://github.com/maple-studios-co-in/pista.git}"
APP_DIR="${APP_DIR:-/var/www/pista}"
DOMAIN="${DOMAIN:-pista.maplestudios.co.in}"
PORT="${PORT:-3000}"
APP_NAME="${APP_NAME:-pista}"
LE_EMAIL="${LE_EMAIL:-admin@maplestudios.co.in}"
RUN_USER="$(whoami)"

echo "▶ Deploying '$APP_NAME' → $APP_DIR  (https://$DOMAIN, port $PORT)"

# ---------- 1. code ----------
if [ -d "$APP_DIR/.git" ]; then
  echo "↻ Updating existing checkout"
  git -C "$APP_DIR" pull --ff-only
else
  echo "⤓ Cloning repo"
  sudo mkdir -p "$APP_DIR"
  sudo chown -R "$RUN_USER:$RUN_USER" "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# ---------- 2. env ----------
if [ ! -f .env ]; then
  echo "✎ Creating .env (generating secrets)"
  cat > .env <<EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
# Multi-tenant: subdomain → tenant. COOKIE_DOMAIN shares login across *.$DOMAIN (needs HTTPS).
BASE_DOMAIN="$DOMAIN"
NEXT_PUBLIC_BASE_DOMAIN="$DOMAIN"
DEFAULT_TENANT_SLUG="${DEFAULT_TENANT_SLUG:-cbtl}"
COOKIE_DOMAIN=".$DOMAIN"
EOF
fi

# ---------- 3. deps + db + build ----------
npm ci
if [ ! -f prisma/dev.db ]; then
  echo "⛁ Initialising + seeding database"
  SEED_PW="${SEED_ADMIN_PASSWORD:-$(openssl rand -base64 18)}"
  SEED_ADMIN_PASSWORD="$SEED_PW" SEED_PASSWORD="$SEED_PW" NODE_ENV=production npm run setup
  echo "🔑 Superadmin: super@shoku.app  ·  password: $SEED_PW"
  echo "   ⚠ Save this now — change it after first login."
else
  echo "⛁ Applying any schema changes (data preserved)"
  npx prisma db push --skip-generate
fi
npm run build

# ---------- 4. process manager ----------
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "↻ Restarting PM2 process"
  PORT="$PORT" pm2 restart "$APP_NAME" --update-env
else
  echo "▶ Starting PM2 process"
  PORT="$PORT" pm2 start npm --name "$APP_NAME" -- start
fi
sudo env PATH="$PATH" pm2 startup systemd -u "$RUN_USER" --hp "$HOME" >/dev/null 2>&1 || true
pm2 save

# ---------- 5. nginx site ----------
NGINX_AVAIL="/etc/nginx/sites-available/$DOMAIN"
if [ ! -f "$NGINX_AVAIL" ]; then
  echo "✎ Creating Nginx site"
  sudo tee "$NGINX_AVAIL" >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    client_max_body_size 30m;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
  sudo ln -sf "$NGINX_AVAIL" "/etc/nginx/sites-enabled/$DOMAIN"
fi
sudo nginx -t && sudo systemctl reload nginx

# ---------- 6. SSL ----------
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "🔒 Issuing Let's Encrypt certificate"
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$LE_EMAIL" --redirect \
    || echo "⚠ certbot failed — run manually:  sudo certbot --nginx -d $DOMAIN"
fi

echo "✓ Done → https://$DOMAIN"
