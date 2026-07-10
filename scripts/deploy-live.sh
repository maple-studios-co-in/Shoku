#!/usr/bin/env bash
#
# Shoku — production deploy (run ON the VPS, from the app directory).
#
#   sudo -u <appuser> bash scripts/deploy-live.sh
#   # or:  ./scripts/deploy-live.sh
#
# What it does, safely and idempotently:
#   1. Fetches origin and hard-syncs the checkout to origin/<branch>
#      (survives the earlier force-push / history rewrite — a plain
#       `git pull` would fail on the divergence).
#   2. Backs up the SQLite DB (timestamped, keeps the last 10).
#   3. Installs deps, applies schema (additive), runs the multi-tenant migration.
#   4. Builds FIRST — the running site is untouched until the build succeeds,
#      so a broken build never causes downtime.
#   5. Restarts under PM2 and health-checks. On failure it prints (or, with
#      AUTO_ROLLBACK=1, performs) a one-command rollback to the previous commit.
#
# Configurable via env:
#   APP_DIR APP_NAME BRANCH BASE_DOMAIN HEALTH_URL AUTO_ROLLBACK SEED_DEMO
#
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/pista}"
APP_NAME="${APP_NAME:-pista}"
BRANCH="${BRANCH:-main}"
BASE_DOMAIN="${BASE_DOMAIN:-getshoku.com}"
HEALTH_URL="${HEALTH_URL:-https://${BASE_DOMAIN}/api/health}"
AUTO_ROLLBACK="${AUTO_ROLLBACK:-0}"     # 1 = auto-revert on failed health check
SEED_DEMO="${SEED_DEMO:-0}"             # 1 = run scripts/seed-demo-data.js after deploy

log() { printf '\n\033[1;32m▸ %s\033[0m\n' "$*"; }
warn() { printf '\n\033[1;33m⚠ %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

cd "$APP_DIR" || die "APP_DIR not found: $APP_DIR"
[ -d .git ] || die "Not a git checkout: $APP_DIR"
command -v pm2 >/dev/null || die "pm2 not installed"

PREV_COMMIT="$(git rev-parse HEAD)"
log "Deploying '$APP_NAME' from origin/$BRANCH  (current: ${PREV_COMMIT:0:8})"

# 1. Sync code — hard reset to origin so a rewritten/force-pushed history is fine.
log "Fetching latest…"
git fetch origin "$BRANCH" --prune
if ! git diff --quiet || ! git diff --cached --quiet; then
  warn "Uncommitted changes on the server will be discarded (deploys must be clean)."
fi
git reset --hard "origin/$BRANCH"
git clean -fd -e .env -e 'prisma/dev.db*'   # drop stray files, KEEP env + db + backups
NEW_COMMIT="$(git rev-parse HEAD)"
log "Now at ${NEW_COMMIT:0:8}  $(git log -1 --pretty=%s)"

if [ "$PREV_COMMIT" = "$NEW_COMMIT" ]; then
  log "Already up to date — rebuilding anyway to be safe."
fi

# 2. Back up the database (timestamped; keep the 10 newest).
if [ -f prisma/dev.db ]; then
  BK="prisma/dev.db.bak-$(date +%Y%m%d%H%M%S)"
  cp prisma/dev.db "$BK"
  log "DB backed up → $BK"
  ls -1t prisma/dev.db.bak-* 2>/dev/null | tail -n +11 | xargs -r rm -f
fi

# 3. Deps + schema + migration.
log "Installing deps…"
npm ci

log "Applying schema (additive; --accept-data-loss covers SQLite table rebuilds)…"
npx prisma db push --skip-generate --accept-data-loss

if [ -f prisma/migrate-to-multitenant.js ]; then
  log "Running multi-tenant migration (idempotent)…"
  node prisma/migrate-to-multitenant.js
fi

# 4. Build BEFORE touching the running process — abort here leaves the site up.
log "Building…"
if ! npm run build; then
  die "Build failed — the live site was NOT restarted and is still serving ${PREV_COMMIT:0:8}."
fi

# 5. Restart (or start) under PM2, then health-check.
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  log "Restarting $APP_NAME…"
  pm2 restart "$APP_NAME" --update-env
else
  warn "$APP_NAME not under PM2 — starting it (npm start)."
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save >/dev/null 2>&1 || true

log "Health check → $HEALTH_URL"
ok=0
for i in $(seq 1 10); do
  code="$(curl -fsS -m 8 -o /dev/null -w '%{http_code}' "$HEALTH_URL" || true)"
  if [ "$code" = "200" ]; then ok=1; break; fi
  printf '  attempt %s/10 → %s\n' "$i" "${code:-no-response}"; sleep 3
done

if [ "$ok" != "1" ]; then
  warn "Health check FAILED after restart."
  if [ "$AUTO_ROLLBACK" = "1" ] && [ "$PREV_COMMIT" != "$NEW_COMMIT" ]; then
    warn "AUTO_ROLLBACK=1 → reverting to ${PREV_COMMIT:0:8}…"
    git reset --hard "$PREV_COMMIT"
    npm ci && npm run build && pm2 restart "$APP_NAME" --update-env
    die "Rolled back to ${PREV_COMMIT:0:8}. Investigate before redeploying."
  fi
  echo
  echo "  Roll back manually with:"
  echo "    cd $APP_DIR && git reset --hard $PREV_COMMIT && npm ci && npm run build && pm2 restart $APP_NAME"
  die "Deploy unhealthy. See: pm2 logs $APP_NAME --lines 50"
fi

# Optional: refresh demo data for the CBTL showcase café.
if [ "$SEED_DEMO" = "1" ] && [ -f scripts/seed-demo-data.js ]; then
  log "Seeding demo data (cbtl, 30d)…"
  node scripts/seed-demo-data.js cbtl 30 || warn "Demo seed skipped/failed (non-fatal)."
fi

log "✓ Live at https://${BASE_DOMAIN}  (${NEW_COMMIT:0:8})"
echo "   Logs:  pm2 logs $APP_NAME --lines 30"
echo "   Super: https://${BASE_DOMAIN}/super"
