# DecraOS MVP — Dev Setup

## Requirements
- Node.js (project uses Next.js)
- Postgres (required for Prisma migrations once you want DB-backed features)

## Environment variables
Copy `.env.example` to `.env` and fill in values.

### Core
- `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@host:5432/db`)
- `TOKEN_ENCRYPTION_KEY` — **hex-encoded 32-byte key** (64 hex chars). Used to encrypt integration tokens at rest.
- `ADMIN_PASSWORD` — protects dev admin endpoint `/api/admin/shops?password=...`

### Shopify
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_SCOPES` (comma-separated)
- `SHOPIFY_APP_URL` (e.g. `https://your-domain.com`)

### Meta (optional)
Only needed when implementing Meta OAuth:
- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI`

## Prisma
This repo currently pins Prisma to **v5.x**.

Generate client:
```bash
npm run prisma:generate
```

Create DB tables (requires Postgres reachable via `DATABASE_URL`):
```bash
npm run prisma:migrate -- --name init
```

Open Prisma Studio:
```bash
npm run prisma:studio
```

## Run
```bash
npm run dev
```

## Useful endpoints
- Briefing API: `GET /api/briefing`
- Briefing page: `/briefing`
- Connect page: `/connect`
- Admin (dev): `GET /api/admin/shops?password=...`
