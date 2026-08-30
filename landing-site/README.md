# PEPLAB Landing (standalone)

Marketing-only Research Gateway site. Deploy this folder as its own Vercel/Netlify project.

## Run locally

```bash
cd landing-site
npm install
cp .env.example .env
npm run dev
```

## Env

| Variable | Purpose |
|----------|---------|
| `VITE_LANDING_SITE_URL` | This landing site's public URL |
| `VITE_MAIN_SITE_URL` | Shop / main PEPLAB site (CTAs for Shop, COA, Contact) |

## Deploy (Vercel)

1. Create a new Vercel project
2. **Root Directory:** `landing-site`
3. Framework: Vite
4. Set env vars from `.env.example`
5. Deploy

Shop CTAs open the main site (`VITE_MAIN_SITE_URL`). This project does **not** include checkout, auth, or admin.
