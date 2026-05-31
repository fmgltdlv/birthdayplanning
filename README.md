# Birthday Planner — For Her

A beautiful web app to plan an unforgettable birthday celebration, with optional **Cloudflare D1** cloud backup via a Workers API.

## Features

- Live countdown, gifts, checklist, guests, menu, surprises, love notes, budget
- **Local mode** — data in browser `localStorage`
- **Cloud sync** — store plan in D1 (Settings → Enable cloud sync)

## Quick start (frontend only)

```bash
npm install
npm run dev
```

## Full stack (Worker + D1 + SPA)

### 1. Apply D1 migrations

```bash
npm install
npm run db:migrate:local   # local dev database
npm run db:migrate:remote  # production D1 (after wrangler login)
```

### 2. Run locally

Terminal A — API + static assets (builds SPA into Worker):

```bash
npm run dev:all
```

Open http://localhost:8787

Or run Vite + Worker separately:

```bash
npm run dev:worker   # http://127.0.0.1:8787
npm run dev          # http://localhost:5173 (proxies /api to worker)
```

### 3. Deploy to Cloudflare

```bash
npm run deploy
```

This runs `vite build` and `wrangler deploy`. The Worker serves:

- `/api/*` — REST API backed by D1
- `/*` — React SPA from `dist/`

### D1 configuration

`wrangler.toml` is configured with your database:

- **Binding:** `DB`
- **Database:** `birthdaydb`
- **ID:** `1b65d897-40ca-494b-8572-f5a6052eec1c`

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/plans` | Create plan (optional `{ plan }` body) |
| GET | `/api/plans/:id?secret=` | Load plan |
| PUT | `/api/plans/:id` | Save `{ secret, plan }` |
| DELETE | `/api/plans/:id?secret=` | Delete plan |

Each plan has a random **id** and **secret** (returned on create). The secret is required for read/write — treat it like a password.

## Project layout

```
worker/src/     Cloudflare Worker API
migrations/     D1 SQL migrations
src/            React frontend
wrangler.toml   Worker + D1 + static assets
```

Made with love.
