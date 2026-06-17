# Pista 🟢

**Pista** is an AI-powered, white-label ordering web app for cafes and restaurant chains — inspired by fudr.in. A chain configures its brand (name, colours, menu) once, and gets a clean, mobile-first ordering experience with AI built in: smart recommendations, "know your cup" food intelligence (origin, ingredients, allergens, nutrition), and smart upsells.

This build is branded around a coffee chain and grounded in The Coffee Bean & Tea Leaf's menu structure.

## Tech stack

- **Next.js 14** (App Router) + **React 18**
- **Tailwind CSS** — brand colours driven by CSS variables for live white-label theming
- **Prisma + SQLite** — real database (menu, users, orders, brand config)
- **NextAuth** — email/password auth with JWT sessions (bcrypt-hashed passwords)
- **API routes** — `/api/menu`, `/api/ai`, `/api/orders`, `/api/brand`, `/api/items`, `/api/register`
- Scripted AI recommender served from the backend (no API key required)

## Getting started

```bash
cd pista
npm install          # also runs `prisma generate`
npm run setup        # creates the SQLite DB (prisma db push) + seeds menu/user
npm run dev
```

Open http://localhost:3000. The marketing site is at `/`; click **View live demo** for the ordering app at `/menu`. It's mobile-first, so narrow your window or use device emulation.

**Demo login:** `demo@pista.app` / `password` (or create your own account at `/register`).

### Environment

A dev `.env` is included with a local SQLite URL and a placeholder `NEXTAUTH_SECRET`. **Change `NEXTAUTH_SECRET` before deploying** (`openssl rand -base64 32`). To move off SQLite later, point `DATABASE_URL` at Postgres and change the Prisma `provider`.

### Backend at a glance

- **Menu** is served from the DB via `/api/menu`; the admin console toggles items live (`PATCH /api/items/[id]`).
- **Auth** gates checkout — placing an order requires a signed-in user; orders persist to the DB and award loyalty points.
- **Brand config** (name, colours, font, AI flags) persists via `GET/PUT /api/brand` and re-themes the whole app live.
- **AI** recommendations come from `POST /api/ai`, which scores live menu items server-side.

## Routes

| Route          | Screen                                                        |
| -------------- | ------------------------------------------------------------- |
| `/`            | **Marketing landing** — the Pista platform site (B2B)         |
| `/menu`        | Ordering app home — categories, AI "picked for you", items     |
| `/item/[id]`   | Item detail — sizes, milk, **AI "Know your cup"** info card    |
| `/ai`          | **Pista AI** chat assistant — mood/diet recommendations        |
| `/cart`        | Bag — quantities, AI pairing upsell, loyalty reward            |
| `/checkout`    | Pickup / dine-in / delivery, payment, order summary           |
| `/success`     | Order confirmation                                            |
| `/account`     | Profile & rewards (links to admin for staff)                  |
| `/admin`       | **Admin dashboard** — overview/analytics                      |
| `/admin/orders`| Orders management + status updates                            |
| `/admin/menu`  | Menu CRUD (add/edit/delete/hide)                              |
| `/admin/customers` | Customer list (orders, spend, points)                    |
| `/admin/discounts` | Promo code management                                    |
| `/admin/branding` · `/admin/settings` | White-label theming + AI flags           |
| `/docs/index.html` | **Documentation site** — dev docs + user guides          |

The admin dashboard requires an **admin** account (the seeded `demo@pista.app` is one). The docs site is a self-contained static page in `public/docs/` — served at `/docs/index.html` and hostable on its own (`npx serve public/docs`).

The landing page (`/`) is the marketing site you'd show prospective cafés; its "View live demo" / "Launch app" buttons drop into the real ordering app at `/menu`.

> Tip: open `/admin` and change the **Primary colour** — the whole customer app re-themes instantly. That's the white-label engine.

## How the AI works

`lib/ai.js` is a rule-based recommender over menu metadata (tags, caffeine, calories, protein). It scores items against the user's intent and explains *why* each pick fits. To use a real LLM later, replace `recommend()` with an API call to a backend route — the UI contract (`{ intro, picks: [{ item, why }] }`) stays the same.

## Project structure

```
pista/
├─ app/
│  ├─ layout.js          # root layout + providers + fonts
│  ├─ globals.css        # tokens (white-label CSS vars) + base styles
│  ├─ page.js            # menu
│  ├─ item/[id]/page.js  # item detail + AI info
│  ├─ ai/page.js         # Pista AI assistant
│  ├─ cart/page.js
│  ├─ checkout/page.js
│  ├─ success/page.js
│  ├─ account/page.js
│  └─ admin/page.js      # white-label console
├─ components/
│  ├─ Providers.js       # Cart + Brand (theme) context, localStorage
│  ├─ Header.js
│  ├─ BottomNav.js
│  ├─ AppShell.js
│  └─ ProductCard.js     # ListItem + RailCard
└─ lib/
   ├─ menu.js            # menu data (swap for API/DB)
   └─ ai.js              # scripted recommender
```

## Roadmap / next steps

- Live-scrape real menu + images from a brand's site into `lib/menu.js`
- Real database + auth (Supabase/Postgres) and order persistence
- Swap scripted AI for a live LLM endpoint
- Multi-tenant brand config loaded by subdomain
- Payments integration
