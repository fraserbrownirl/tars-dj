# loficities.com — REA-lite evidence (2026-11-02)

Target: https://loficities.com/ (Cloudflare, HIT)
Bundle: `assets/app-NE64HTAH.js` (7,685,371 bytes), `assets/app-81042f20ed286e7d.css`
Manifest: `site.webmanifest` → standalone PWA, icon-192/512/maskable-512, theme #07081a, bg #05060f
SW: `sw.js` CACHE lofi-cities-1d720a3be58ea1b7e59a — precaches every `city/` + assets (offline-first once opened)
SEO: schema.org WebSite + Person (Safa Elmali) + WebApplication + 60+ WebPage hasPart + FAQPage (20 Q&A) — all in one JSON-LD graph.

## DOM skeleton (from live HTML)

#screen (canvas, pixelated, fixed inset 0) — sole renderer, procedural pixel paint, 240s seamless loop.
#jobSpot, #xSpot, #planeSpot (all hidden anchors, billboard/plane data-attrs)
.jobs ticker (#jobs) — "Help wanted" strip, 26px high, data-content-destination/placement, jobs-off class gated by localStorage `lofi-cities:job-strip` / `switches.jobStrip`.
.hud-city header + coffee/shop/followX/watchLive/github/x icon rail
#newsBird canvas, pop-items for tour (off/5/10/15/30/night) and weather (city/drizzle/rain/thunderstorm/snow/leaves/clear)
Globe view: .globe-surface (role=application, roledescription globe), .globe-labels, .globe-card, .globe-live, zoom 1.6/0.625, #globeRequest (Buy Me a Coffee)
Vibe picker: #vibeStyle fieldset data-view grouped/list/card, #styleCardIcon 12×12, 18 styles: jazzhop, lofi piano, ambient, bossa nova, synth city pop, lofi house, chill guitar, sad lofi, neo-soul, liquid drum'n'bass, dub, chiptune, medieval lofi, Japanese lofi, oud, sitar, spooky Halloween, classical (Mozart/Beethoven) + chill↔upbeat + full/no-drums/chords-only.
Player dock (bottom, safe-area aware): play/pause, next, queue, vibe, timer, fullscreen, pip, note, radio, help, close, mixer (3 sliders), rain/storm/weather, cities, tour, films, snow/leaf/save/image/postcard/share/copy/film + trophy + chat/together/send/smile + heart/tune/star/moon reactions + settings/user/google/stamp/pin.

## JS architecture (static hints from 7.6MB bundle)

Vite build, no framework fingerprint (vanilla modules). Entry `assets/app-NE64HTAH.js`.
Origins observed: `live.loficities.com` (live counts, chat, reactions, lanterns via fetch credentials omit, no-store, AbortSignal.timeout), `x.com/loficitiesapp`, `youtube.com/live/...`, GitHub/X profiles (see source HTML for full outbound list).
Fetchers: guide/${id}.json, whats-new/news.json, city .json (places/restaurants), WebSocket-less polling for live.
Storage: localStorage keys `lofi-cities:job-strip`, `lofi-cities:switches` (jobStrip, etc.), plus passport (seconds per city), settings (style/vibe/weather/volumes/mixer/billboards/favourites), tasks/notes, anonymous ids; cookie `live.loficities.com` only when Google-signed (half-year, sub+email).
Audio: Web Audio API, no samples — chords/drums/bass/melody synthesized live (rules-based, not model). City ambience separate volume + per-sound mixer. Timer chimes/bell.
Canvas: per-city program paints pixel by pixel (AI-assisted code, not image gen), weather/lights/people in same code, exported frame-by-frame to 1920×1080/60fps MP4 loops (4 collections × 16–21 cities, no audio) — source for the owned packs in ~/Downloads.

## Shop wiring (dataset contract from reverse-engineer)

- anchors carry `data-shop-product` + `data-shop-location`:
  `storefront@plane` (#planeSpot), `storefront@header` (#shopLink, hidden until JS reveals), `city@save_menu` + `storefront@save_menu` (save menu, 4 collections/56 cities copy)
- JS reads `data-shop-product` to route clicks to the storefront; header/save-menu/plane share the same dataset contract (verified via https://github.com/morluto/rea trace + live HTML).
- TARS keeps the contract verbatim: `data-shop-product`/`data-shop-location` → shop URL → `https://tars.dj/shop` (one map change).

## Cities (from sitemap + packs)

Sitemap: 60+ cities, each `/city/` static dir (pre-cached by SW). Ordered roughly: paris, tokyo, new-york, london, rio, istanbul, hong-kong, sydney, san-francisco, hamburg, amsterdam… through almaty.
Owned packs (~/Downloads/lofi-cities-europe-part-*.zip, 3× ~1.2–1.4G, 16 total):
  amsterdam, athens, barcelona, berlin, budapest, copenhagen, dublin, florence, hamburg, lisbon, london, madrid, paris, prague, rome, venice
Each: 1920×1080 H.264 High@L4.2 yuv420p bt709, 60fps, 240.0s (14400 frames), ~132–360MB, no audio — matches site's 4-min loop spec.

## REA status

Node upgraded 24.15.0→24.22.1 via fnm (satisfies rea-agents@6.8.0 ^24.22.1), `rea setup --client cursor --yes` applied (mcp.json now has rea server, restart pending for tools). Full headless REA browser capture deferred — manual evidence above is sufficient for scaffold; run `npx rea capture_browser_scenario ...` after Cursor reload for pixel-diff Evidence.

## tars.dj direction

Keep loficities contract (canvas #screen, hud-city, globe, vibe/weather/tour, dock, shop data-attrs, PWA/SW, SEO JSON-LD) but source is TARS-owned video loops, not procedural canvas. Audio sources: box via tars.dj/stream (proxied, no bare IP in client) + local WebAudio fallback. Shop maps to TARS store (same data-attrs). Chat/live optional later (live.loficities.com not reused).

