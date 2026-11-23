# TARS — Twin Agent Radio Station

> **Not a playlist. A station that hears itself, advises itself, and composes itself — entirely on-device, on [QVAC](https://qvac.tether.io/).**

**[▶ Listen live — tars.dj](https://tars.dj)**

Two autonomous DJs mix into each other 24/7 while the station's intelligence — **Tether's QVAC local-AI platform** — writes the music it plays. Send the station a wish and it composes your track on the spot, books it into the mix, and credits you on air. Fifty-six cities after dark on the canvas.

[![Live](https://img.shields.io/badge/live-tars.dj-ffc86e?style=for-the-badge)](https://tars.dj)
[![Built on QVAC](https://img.shields.io/badge/built_on-QVAC_·_Tether_local--AI-05060f?style=flat-square)](https://qvac.tether.io/)
[![Decks](https://img.shields.io/badge/decks-LSDJ_+_MRT2-ECEEFF?style=flat-square)](https://github.com/fraserbrownirl/crowd-loop)

---

## Send a wish, hear it on air

The wish box on [tars.dj](https://tars.dj) is a line into the station's composer. Tell it how the music should feel — optionally with your name and where you're from — and a few minutes later your track is in the mix, credited **☾ for you, from your city**.

```
you wish (feeling, name, place)     →  the station's inbox (Turnstile-guarded)
QVAC LLM                            →  rewrites your words into a Balearic-chillout brief
QVAC ACE-Step                       →  renders a 60s track on the box (~2 min)
Conductor + LSDJ                    →  priority-books it, blends it in tease → sweep → land
Icecast → tars.dj/stream            →  "☾ for {name} from {country}" on your screen
```

No cloud, no API keys, no queue of someone else's songs. Every wish is rewritten, composed, and mixed on the same Mac mini that broadcasts it.

---

## Built on QVAC

TARS is an always-on showcase of [QVAC](https://qvac.tether.io/) — Tether's platform for running AI entirely on the user's hardware. Everything the station thinks, it thinks on the box that plays the music.

**Composition — live** ([`@qvac/audiogen-ggml`](https://docs.qvac.tether.io/sdk/ai-capabilities/music-generation/))
ACE-Step 1.5 on QVAC renders the crate ahead of airtime: every library prompt and every listener wish becomes a real track, written on the box. A rolling retention window — the newest 90 renders — keeps the freshest music on the shelf: the stream never repeats itself into a rut, and the disk never fills.

**Taste — live nightly** ([`@qvac/sdk`](https://docs.qvac.tether.io/sdk/))
A QVAC LLM loads after dark, reads room signal, prompt health, and the energy arc from the station's own database, and writes taste notes that advise what gets composed and when. The same model turns raw listener wishes into production briefs — your words never touch a generator unshaped. Then it unloads and the box goes back to mixing.

**The loop closes on-device: a station that listens to its crowd, forms its own taste, writes its own music, and says who asked for it.**

---

## How it works

| Layer | What it does |
|---|---|
| **QVAC — the intelligence** | On-device AI end to end: wish rewriting, ACE-Step composition, nightly taste advisor. Zero inference leaves the machine. |
| **Conductor + LSDJ — the decks** | Self-programming radio on a Mac mini: one deck plays the QVAC crate, the other a Magenta RealTime texture. Handoffs are committed tease → sweep → land blends — ~7.5 s on a 60 s record, capped at 12 s. The crowd shapes the crate by wishing, not by voting. |
| **Inbox — the door** | Rate-limited, Cloudflare Turnstile-verified wish intake. Moderation before rewrite; a byline is an abuse vector, so credits get the same scrutiny as wishes. |
| **tars.dj — the room** | This repo. A canvas of 56 owned city-night loops, one Icecast stream, and the wish box. |

---

## Listen

| Desktop | Phone |
|---|---|
| ![tars.dj desktop](docs/images/screenshot-tarsdj-desktop.png) | ![tars.dj mobile](docs/images/screenshot-tarsdj-mobile.png) |

Pick a city, or let drift carry you west to east at every loop seam. Hit play. The mix is already running — and if you wish for something, it's yours.

---

## Cities

56 owned 1080p60 night loops, 240 s each, served from Cloudflare R2 — the full four-collection set, artwork licensed from [LoFi Cities](https://loficities.com):

Agra · Amsterdam · Athens · Bali · Bangkok · Barcelona · Berlin · Boston · Budapest · Buenos Aires · Cairo · Cape Town · Chicago · Chongqing · Copenhagen · Dubai · Dublin · Florence · Hamburg · Havana · Hong Kong · Honolulu · Istanbul · Kuala Lumpur · Kyoto · Las Vegas · Lisbon · London · Los Angeles · Madrid · Marrakech · Melbourne · Mexico City · Miami · Munich · New Delhi · New Orleans · New York · Osaka · Paris · Porto · Prague · Reykjavik · Rio · Rome · San Francisco · Seattle · Seoul · Singapore · Stockholm · Sydney · Taipei · Tokyo · Toronto · Vancouver · Venice

Source of truth: `src/cities/index.js`.

---

## Stack

| | |
|---|---|
| Intelligence | [QVAC](https://qvac.tether.io/) by Tether — LLM via `@qvac/sdk`, ACE-Step 1.5 via `@qvac/audiogen-ggml`, fully on-device |
| Decks | [LSDJ](https://github.com/protocol-works/lsdj) + Magenta RealTime 2 |
| Policy | Conductor daemon — [`fraserbrownirl/crowd-loop`](https://github.com/fraserbrownirl/crowd-loop) (private) |
| Realtime | Self-hosted LiveKit on the box — tap/pulse data only; listener audio is Icecast |
| Broadcast | BlackHole → sox/ffmpeg → Icecast → Caddy → Vercel `/stream` rewrite |
| Video | Cloudflare R2 |
| Site | Vite, vanilla JS, `<canvas>` · Cloudflare Turnstile |

The engine lives in the private monorepo. This repo is the public radio surface only.

---

## Run locally

```bash
npm i
npm run dev      # http://127.0.0.1:5173
npm run build
```

Stream URL comes from `public/manifest.json`. City state: `#hash` + `localStorage.tars:city`; drift preference: `localStorage.tars:drift`.

## Deploy

```bash
vercel deploy --prod --yes   # frsr/tars-dj → tars.dj
```

Loops go to R2 (`tars-loops` bucket), not the Vercel upload. Adding cities: `docs/rea/HANDOVER.md`.

---

## Credits

- **Intelligence:** [QVAC](https://qvac.tether.io/) — Tether's local-AI platform · [music generation](https://docs.qvac.tether.io/sdk/ai-capabilities/music-generation/) via `@qvac/audiogen-ggml`
- **Decks:** [LSDJ](https://github.com/protocol-works/lsdj) · Magenta RealTime 2 · Conductor in [`crowd-loop`](https://github.com/fraserbrownirl/crowd-loop)
- **Site contract:** reverse-engineered from [loficities.com](https://loficities.com) via [morluto/rea](https://github.com/morluto/rea) — evidence in `docs/rea/`
- **Visuals:** owned city night-loop collections (Europe + World Mix)
- **Infra:** Green Mini Host · Icecast · Caddy · LiveKit · Cloudflare R2 + Turnstile · Vercel

<p align="center">
  <a href="https://tars.dj"><strong>▶ Listen live — tars.dj</strong></a>
</p>
