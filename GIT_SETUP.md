# Pushing Pista to GitHub

Repo: `https://github.com/maple-studios-co-in/pista.git`

> Run these in **Terminal on your Mac**, from the app folder:
> `cd "/Users/adityaagrawal/Documents/Claude/Projects/pistachio/pista"`

## 0. One-time cleanup (important)

A `.git` folder was created during setup but left stale lock files that can't be
removed from here. Start clean:

```bash
rm -rf .git
```

## 1. Create the repo on GitHub (if it doesn't exist yet)

On github.com, create a new repository named **pista** under the
`maple-studios-co-in` account. Do **not** add a README, .gitignore or license
(this project already has them).

## 2. Initialise and make the first commit

```bash
git init
git branch -M main
git config user.name  "maple-studios-co-in"
git config user.email "admin@maplestudios.co.in"

git add .
git commit -m "Initial commit: Pista — AI white-label ordering platform"
```

The `.gitignore` already excludes secrets and local files, so this commit will
**not** include `.env`, `node_modules/`, `.next/`, or `prisma/dev.db`.
(Verify with `git status` — you should see ~60 files, none of those.)

## 3. Add the remote and push

```bash
git remote add origin https://github.com/maple-studios-co-in/pista.git
git push -u origin main
```

## 4. Authentication

GitHub no longer accepts your account password over HTTPS. Use **one** of:

- **Personal Access Token (PAT)** — create at GitHub → Settings → Developer
  settings → Personal access tokens → *Fine-grained tokens* (scope: this repo,
  Contents: Read/Write). When `git push` prompts for a password, paste the token.
- **GitHub CLI** — `brew install gh` then `gh auth login` (handles auth for you).
- **SSH** — add an SSH key to GitHub, then use the SSH remote instead:
  `git remote set-url origin git@github.com:maple-studios-co-in/pista.git`

## What gets committed

Tracked: `app/`, `components/`, `lib/`, `prisma/schema.prisma`, `prisma/seed.js`,
`public/` (incl. `public/docs/`), config files, `package.json`,
`package-lock.json`, `.env.example`, `.gitignore`, `README.md`.

Ignored: `.env`, `node_modules/`, `.next/`, `prisma/dev.db`.

## After cloning elsewhere

```bash
npm install
cp .env.example .env     # then set a real NEXTAUTH_SECRET
npm run setup            # creates + seeds the database
npm run dev
```

## Optional: protect the default branch

On GitHub → Settings → Branches, add a rule for `main` to require pull-request
reviews before merging once collaborators are added.
