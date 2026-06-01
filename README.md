# Booty Bear Time Capsule

Open time capsule: notes and photos. No login.

```
frontend/     React + Vite
backend/      Cloudflare Worker + D1 + R2
```

## Cloudflare Workers Builds (GitHub)

| Setting | Value |
|---------|--------|
| **Root directory** | *(empty — repo root)* |
| **Build command** | `npm install && npm run deploy` |
| **Deploy command** | **Leave empty** |

The build command already runs `wrangler deploy`. A second deploy step like `npx wrangler deploy` will **fail** (monorepo / wrong directory).

Worker name in `backend/wrangler.toml` must match your Cloudflare project: `birthdayplanning`.

**Live URL:** https://birthdayplanning.thefieldmappinggroup.workers.dev

### After deploy

1. Run D1 migration `backend/migrations/0002_time_capsule.sql` on `birthdaydb` (if not done).
2. Confirm bindings: `DB` → D1, `MEDIA` → `bootybearcapsule`.

## Local dev

```bash
npm install
npm run db:migrate:local
npm run dev:all
```

## Manual deploy

```bash
npm run deploy
```
