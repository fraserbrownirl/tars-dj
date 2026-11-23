# TARS — Twin Agent Radio Station

> **Not a playlist. Two AI decks, one seamless set, around the clock.**

**[▶ Listen live — tars.dj](https://tars.dj)**

Two autonomous DJs mix into each other 24/7. A local **[QVAC](https://qvac.tether.io/) LLM is the station's taste advisor** — every night it reviews the station's own logs on-device and writes its notes. No cloud, no API keys. Sixteen European cities after dark on the canvas.

[![Live](https://img.shields.io/badge/live-tars.dj-ffc86e?style=for-the-badge)](https://tars.dj)
[![QVAC](https://img.shields.io/badge/taste-QVAC_LLM_·_on--device-05060f?style=flat-square)](https://qvac.tether.io/)
[![Decks](https://img.shields.io/badge/decks-LSDJ_+_MRT2-ECEEFF?style=flat-square)](https://github.com/fraserbrownirl/crowd-loop)

---

## How it works

| Layer | What it does |
|---|---|
| **QVAC LLM — the taste** | Nightly advisor running on [`@qvac/sdk`](https://docs.qvac.tether.io/sdk/). Reads tap history, prompt health, and the energy arc from the station's own database; writes suggestions for the crate and the arc. Fully on-device. |
| **Conductor + LSDJ — the decks** | Audience-steered mixing on a Mac mini. Listeners tap *more* or *next*; two Magenta RealTime decks negotiate every handoff in phrase, on beat, in key. |
| **tars.dj — the room** | This repo. A canvas of 16 owned city-night loops and one Icecast stream. |

The music never leaves the box. Neither does the taste.

```
QVAC LLM (nightly, on-device)  →  taste notes for the crate & arc
Conductor + LSDJ / MRT2        →  the live mix
BlackHole → Icecast            →  tars.dj/stream
City loops (Cloudflare R2)     →  the canvas
```

---

## Listen

| Desktop | Phone |
|---|---|
| ![tars.dj desktop](docs/images/screenshot-tarsdj-desktop.png) | ![tars.dj mobile](docs/images/screenshot-tarsdj-mobile.png) |

Pick a city. Hit play. The mix is already running.

---

## Cities

16 owned 1080p60 night loops, 240 s each, served from Cloudflare R2:

Amsterdam · Athens · Barcelona · Berlin · Budapest · Copenhagen · Dublin · Florence · Hamburg · Lisbon · London · Madrid · Paris · Prague · Rome · Venice

Source of truth: `src/cities/index.js`.

---

## Stack

| | |
|---|---|
| Taste | [QVAC](https://qvac.tether.io/) by Tether — Qwen3-4B via `@qvac/sdk`, on-device |
| Decks | [LSDJ](https://github.com/protocol-works/lsdj) + Magenta RealTime 2 |
| Policy | Conductor daemon — [`fraserbrownirl/crowd-loop`](https://github.com/fraserbrownirl/crowd-loop) (private) |
| Broadcast | BlackHole → sox/ffmpeg → Icecast → Caddy → Vercel `/stream` rewrite |
| Video | Cloudflare R2 |
| Site | Vite, vanilla JS, `<canvas>` |

The engine and the iOS listener live in the private monorepo. This repo is the public radio surface only.

---

## Run locally

```bash
npm i
npm run dev      # http://127.0.0.1:5173
npm run build
```

Stream URL comes from `public/manifest.json`. City state: `#hash` + `localStorage.tars:city`.

## Deploy

```bash
vercel deploy --prod --yes   # frsr/tars-dj → tars.dj
```

Loops go to R2 (`tars-loops` bucket), not the Vercel upload. See `docs/rea/HANDOVER.md`.

---

## Credits

- **Taste:** [QVAC](https://qvac.tether.io/) — Tether's local-AI platform
- **Decks:** [LSDJ](https://github.com/protocol-works/lsdj) · Magenta RealTime 2 · Conductor in [`crowd-loop`](https://github.com/fraserbrownirl/crowd-loop)
- **Site contract:** reverse-engineered from [loficities.com](https://loficities.com) via [morluto/rea](https://github.com/morluto/rea) — evidence in `docs/rea/`
- **Visuals:** owned Europe night-loop collection
- **Infra:** Green Mini Host · Icecast · Caddy · Cloudflare R2 · Vercel · LiveKit Cloud

<p align="center">
  <a href="https://tars.dj"><strong>▶ Listen live — tars.dj</strong></a>
</p>
