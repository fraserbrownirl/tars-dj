# Instruction for Cursor agent: TARS DJ videos onto Cloudflare R2

> SUPERSEDED 2026-11-02: Muse took this over once wrangler was authed (see
> HANDOVER.md §10). Only the 5 over-300MB uploads remain, pending R2 S3 keys.

## Goal

The 16 owned city loops must play on https://tars.dj exactly like the
reference site serves its MP4s: same-origin-style video files behind
Cloudflare's cache. Vercel cannot host them (3.9G; the API aborts the
upload — proven 2026-11-02), so they live on Cloudflare R2 and the site
points at them there. Music is unaffected (live box radio via /stream).

## Starting state (verified)

- Repo: /Users/fraserbrown/Dev/TarsDJ (Vite 6.4, no git repo, no framework).
- Videos (source of truth, do not rename): public/loops/*.mp4 — 16 files,
  1920x1080 H.264 60fps 240s, ~3.9G total. Filenames are canonical in
  src/cities/index.js (CITIES) and public/manifest.json (cityLoops).
- Shop was REMOVED per the user (no /shop anywhere). Do not re-add it.
- Site shell is LIVE: Vercel project frsr/tars-dj (local .vercel/ link
  exists), production deploy aliased to www.tars.dj. `.vercelignore`
  excludes public/loops, dist, loops, node_modules, .env* — keep it so.
- /stream rewrite (vercel.json → box Icecast) verified with a 106s pull.
  Do not touch it.
- Stable Vercel CLI: /Users/fraserbrown/.fnm/node-versions/v24.22.1/installation/bin/vercel
  (auth as frsrventures intact). Deployment URLs sit behind Deployment
  Protection — verify with `vercel curl <url>`, not plain curl.
- Full context: docs/rea/HANDOVER.md (§9), docs/rea/loficities-evidence.md.

## Steps

1. In Cloudflare (you have access; this session does not), create an R2
   bucket, e.g. `tars-loops`. Upload all 16 MP4s with keys exactly
   `loops/{filename}` — filenames byte-identical to public/loops/.
2. Enable public access. If tars.dj is already on Cloudflare, prefer a
   custom domain such as https://media.tars.dj (full CDN caching, stable
   branding). Otherwise use the bucket's public r2.dev URL — it works
   with zero DNS changes. Either way the base URL must contain no bare IP.
3. Code change (two files, one base constant):
   - src/cities/index.js: add `const LOOP_BASE = "<public base, no trailing slash>"`
     and make `loopUrl(city)` return `` `${LOOP_BASE}/loops/${city.file}` ``.
   - public/manifest.json: rewrite every cityLoops value to the matching
     absolute URL (same 16 files, same order).
   - Do not change CITIES ids/labels, filenames, the player, or the stream.
4. Rebuild: `npm run build`. Verify: no `shop` refs and no IP/`sslip`
   strings anywhere in index.html, src/, public/manifest.json, dist/.
5. Redeploy: `vercel deploy --prod --yes` from Dev/TarsDJ (project already
   linked). Confirm the production alias (www.tars.dj).

## Verify and report back

- HEAD or byte-range GET all 16 R2 URLs: expect 200/206 + video/mp4 bytes.
  Note cache status on a second pull (HIT/MISS) if on a custom domain.
- Deployed page: title + #screen/#cityPicker/#stream/#playBtn present.
- Deployed manifest.json: 16 absolute video URLs + stream https://tars.dj/stream.
- /stream still returns 200 audio/mpeg with flowing bytes (rewrite intact).
- Confirm the production deployment URL + alias.

## Constraints

- No bare IPs in any client-shipped file (HTML/JS/manifest/video URLs).
- No /shop surface of any kind. No new dependencies. No changes to the
  FRS1 box, the conductor, channel.toml, or the crowd-loop-listener
  project. R2 bucket keys must stay `loops/{original filename}` so packs
  remain swappable 1:1.

## Done when

You reply with: bucket name, public base URL, per-video HTTP status for
all 16, production deployment URL + alias, and the /stream check result.
