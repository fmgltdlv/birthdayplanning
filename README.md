# Booty Bear Time Capsule

Open time capsule: notes and photos. No login. yay

```
frontend/     React + Vite
backend/      Cloudflare Worker + D1 + R2
.github/      GitHub Actions (CI + deploy)
```

## GitHub Actions

### Secrets (required for deploy)

In **GitHub → repo → Settings → Secrets and variables → Actions**, add:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with **Workers Scripts Edit** and **D1 Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (dashboard URL or Workers overview) |

Create a token: [Cloudflare API tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Custom Token** → permissions for Account / Workers Scripts / Edit, Account / D1 / Edit, Account / Workers R2 Storage / Edit.

### Workflows

| File | When | What |
|------|------|------|
| `.github/workflows/ci.yml` | PRs and pushes to `main` | `npm ci`, lint, build |
| `.github/workflows/deploy.yml` | Push to `main` or manual | lint, build, D1 migrate, `wrangler deploy` |

**Live URL:** https://birthdayplanning.thefieldmappinggroup.workers.dev

If you also use **Cloudflare Workers Builds** in the dashboard, you can disable it to avoid double deploys, or disable the GitHub deploy workflow and keep dashboard-only deploys.

## Cloudflare (manual)

| Resource | Name / binding |
|----------|----------------|
| D1 | `birthdaydb` → `DB` |
| R2 | `bootybearcapsule` → `MEDIA` |

```bash
npm install
npm run build
npm run deploy:cloudflare
npm run db:migrate:remote   # if needed
```

## Local dev

```bash
npm install
npm run db:migrate:local
npm run dev:all
```

Open http://localhost:8787
