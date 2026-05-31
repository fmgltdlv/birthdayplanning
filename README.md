# Birthday Planner — For Her

Monorepo with a **React frontend** and **Cloudflare Worker + D1 backend**.

```
frontend/     React + Vite SPA
backend/      Cloudflare Worker API + D1 + static assets
```

## Quick start

```bash
npm install
```

### Frontend only

```bash
npm run dev
```

Opens http://localhost:5173 (proxies `/api` to the worker when it is running).

### Backend + frontend (full stack)

```bash
npm run db:migrate:local
npm run dev:all
```

Opens http://localhost:8787 (Worker serves API + built SPA).

Or run in two terminals:

```bash
npm run dev:backend   # http://127.0.0.1:8787
npm run dev           # http://localhost:5173
```

## Deploy to Cloudflare

```bash
npm run db:migrate:remote
npm run deploy
```

Builds `frontend/dist`, then deploys the Worker from `backend/` with D1 and static assets.

## Scripts (from repo root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (frontend) |
| `npm run dev:backend` | Wrangler dev (backend) |
| `npm run dev:all` | Build frontend + Wrangler dev |
| `npm run build` | Production build (frontend) |
| `npm run deploy` | Build + deploy Worker |
| `npm run db:migrate:local` | Apply D1 migrations locally |
| `npm run db:migrate:remote` | Apply D1 migrations to production |

## Cloud sync

In the app: **Settings → Cloud backup (D1)**. See `backend/` for API routes and `frontend/src/api/` for the client.

Made with love.
