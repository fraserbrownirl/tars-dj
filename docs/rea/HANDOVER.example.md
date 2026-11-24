# Handover (local ops only)

`HANDOVER.md` is **gitignored** — keep your operator runbook locally (`docs/rea/HANDOVER.md`).

Public repo deploy:

- **`TARS_UPSTREAM`** — Vercel env + `env.example` → `.env.local` for dev proxy (`middleware.js` + Vite).
- **Adding cities** — update `src/cities/index.js`, upload loops to R2, refresh `public/manifest.json`, `npm run build`, `vercel deploy --prod`.

Do not commit box IPs, SSH hosts, LiveKit project slugs, or API secrets.