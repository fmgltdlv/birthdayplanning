# Booty Bear Time Capsule

Open time capsule: anyone with the link can leave **notes** and **photos**. No login.

```
frontend/     React + Vite
backend/      Cloudflare Worker + D1 + R2
```

## Cloudflare setup

| Resource | Name / binding |
|----------|----------------|
| **D1** | `birthdaydb` → binding `DB` |
| **R2** | `bootybearcapsule` → binding `MEDIA` |
| **Worker** | Serves app + `/api/*` |

### Migrations (run once on production D1)

Apply `backend/migrations/0002_time_capsule.sql` (and `0001` if fresh):

```bash
npm run db:migrate:remote
```

Or paste `0002_time_capsule.sql` into the D1 SQL console in the dashboard.

### Deploy

```bash
npm install
npm run deploy
```

## Local dev

```bash
npm install
npm run db:migrate:local
npm run dev:all
```

Open http://localhost:8787

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/entries` | List entries (newest first) |
| POST | `/api/entries/note` | `{ text, authorName? }` |
| POST | `/api/entries/photo` | `multipart`: `file`, `authorName?`, `caption?` |
| GET | `/api/media/:id` | Photo bytes |

Photos are stored in R2; metadata in D1.
