# Deploy Pista to pista.maplestudios.co.in (Hostinger KVM, Node + PM2)

Goal: run the Pista app with PM2 on your VPS and serve it at
`https://pista.maplestudios.co.in`, alongside your existing `maplestudios.co.in`.

> SSH in first: `ssh root@<your-vps-ip>` (Hostinger → VPS → Overview shows the IP).

---

## Step 0 — Identify your web server (you weren't sure)

Run:

```bash
sudo ss -ltnp | grep -E ':80|:443'
```

- See `nginx` → follow the **Nginx** section.
- See `apache2` or `httpd` → follow the **Apache** section.
- See `litespeed` / `lshttpd` → you're on **OpenLiteSpeed/CyberPanel** (panel section).
- Also check: `which nginx apache2 httpd; ls /usr/local/lsws 2>/dev/null && echo litespeed`

Tell me which one if you want exact clicks for a panel.

---

## Step 1 — DNS: point the subdomain at the VPS

Get the server's public IP:

```bash
curl -4 ifconfig.me
```

In your DNS manager (Hostinger hPanel → **Domains → maplestudios.co.in → DNS / Nameservers**, or wherever the domain's nameservers point), add:

| Type | Name    | Value (points to) | TTL |
| ---- | ------- | ----------------- | --- |
| A    | `pista` | `<your-vps-ip>`   | 300 |

Verify (may take a few minutes):

```bash
dig +short pista.maplestudios.co.in   # should print your VPS IP
```

---

## Step 2 — Install Node 20, PM2 and git (skip what's already there)

```bash
node -v   # if missing or < 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2
```

---

## Step 3 — Get the code, configure, build, run

```bash
cd /opt
sudo git clone https://github.com/maple-studios-co-in/pista.git
sudo chown -R $USER:$USER pista
cd pista

cp .env.example .env
nano .env
```

Set these in `.env`:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://pista.maplestudios.co.in"
NEXTAUTH_SECRET="PASTE_A_SECRET"
```

Generate the secret with: `openssl rand -base64 32`

> If the GitHub repo is **private**, the clone will ask for credentials — use a
> GitHub Personal Access Token as the password (or add a deploy key).

Build and start:

```bash
npm ci
npm run setup          # creates + seeds the SQLite database
npm run build
pm2 start npm --name pista -- start    # runs on 127.0.0.1:3000 via the proxy below
pm2 save
pm2 startup            # run the command it prints, to start on boot
```

The app now listens on port **3000** locally. We'll proxy the subdomain to it.

---

## Step 4 — Reverse proxy + HTTPS

### If Nginx

```bash
sudo nano /etc/nginx/sites-available/pista.maplestudios.co.in
```

```nginx
server {
    listen 80;
    server_name pista.maplestudios.co.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pista.maplestudios.co.in /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS (free Let's Encrypt cert + auto-redirect)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pista.maplestudios.co.in
```

### If Apache

```bash
sudo a2enmod proxy proxy_http headers ssl rewrite
sudo nano /etc/apache2/sites-available/pista.maplestudios.co.in.conf
```

```apache
<VirtualHost *:80>
    ServerName pista.maplestudios.co.in
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    RequestHeader set X-Forwarded-Proto "http"
</VirtualHost>
```

```bash
sudo a2ensite pista.maplestudios.co.in
sudo systemctl reload apache2

sudo apt-get install -y certbot python3-certbot-apache
sudo certbot --apache -d pista.maplestudios.co.in
```

### If a control panel (CyberPanel/OpenLiteSpeed, CloudPanel, hPanel, aaPanel)

1. Create a **new website / subdomain** `pista.maplestudios.co.in` in the panel.
2. Add a **reverse proxy** (a.k.a. proxy / app config) pointing to
   `http://127.0.0.1:3000`.
3. Issue an **SSL certificate** for the subdomain from the panel's SSL section.

(Tell me the panel name and I'll give the exact menu path.)

---

## Step 5 — Lock down the app port

The app should only be reachable through the proxy, not directly on `:3000`:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # or 'Apache Full'
sudo ufw enable               # 3000 stays internal-only
```

---

## Step 6 — Verify

```bash
pm2 status
curl -I https://pista.maplestudios.co.in     # expect HTTP/2 200
```

Open `https://pista.maplestudios.co.in` — landing page. The app is at `/menu`,
the dashboard at `/admin` (log in as the seeded admin `demo@pista.app` /
`password`, then change it).

---

## Updating later (after you push changes to GitHub)

```bash
cd /opt/pista
git pull
npm ci
npx prisma db push        # only if the schema changed
npm run build
pm2 restart pista
```

---

## Notes & hardening

- **Change the demo admin.** The seed creates `demo@pista.app` / `password` as an
  admin. Create a real admin or change the password (e.g. via `npx prisma studio`
  on the server, or a one-off script) before sharing the URL.
- **Backups.** The whole database is the file `/opt/pista/prisma/dev.db` — back it
  up (e.g. a nightly `cp`/`rsync` cron). For higher traffic, switch to Postgres
  (set `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`).
- **Logs.** `pm2 logs pista`. **Restart on crash/boot** is handled by `pm2 save` +
  `pm2 startup`.
```
