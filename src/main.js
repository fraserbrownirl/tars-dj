import { CITIES, WEST, EAST, ROTATION_ORDER, loopUrl } from "./cities/index.js";

const MANIFEST_URL = "/manifest.json";
const DEFAULT_STREAM = "https://tars.dj/stream";
const WISH_TEXT_MAX = 120;
const WISH_NAME_MAX = 24;
const WISH_COUNTRY_MAX = 56;

function allowedStreamHosts() {
  const hosts = new Set([location.hostname, "tars.dj", "www.tars.dj"]);
  return hosts;
}

function resolveStreamUrl(raw) {
  if (!raw || typeof raw !== "string") return DEFAULT_STREAM;
  try {
    const u = new URL(raw, location.origin);
    if (u.protocol !== "https:" && u.protocol !== "http:") return DEFAULT_STREAM;
    if (!allowedStreamHosts().has(u.hostname)) return DEFAULT_STREAM;
    return u.href;
  } catch {
    return DEFAULT_STREAM;
  }
}

function sanitizeWishField(value, maxLen) {
  const collapsed = String(value).replace(/[\r\n\u2028\u2029]+/g, " ").trim();
  if (collapsed.length <= maxLen) return collapsed;
  return collapsed.slice(0, maxLen);
}
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d", { alpha: false });
const picker = document.getElementById("cityPicker");
const audio = document.getElementById("stream");
const playBtn = document.getElementById("playBtn");
const nowPlaying = document.getElementById("nowPlaying");

let current = CITIES[0];
function makeLoopVideo() {
  const v = document.createElement("video");
  v.loop = true; v.muted = true; v.playsInline = true;
  v.preload = "auto";
  return v;
}
let video = makeLoopVideo();
// Preloader: warms the NEXT city on the drift route while the current one
// plays, so the seam switch promotes an already-buffered element instead of
// starting a cold fetch (the black gap between cities).
let preloader = makeLoopVideo();
// Once any frame has been drawn we never clear to black again — the last
// city stays on screen until the next one's frames arrive.
let hasFrame = false;
let raf = 0, streamUrl = DEFAULT_STREAM;

// --- Drift: auto-rotate west→east around the world at the 240s loop seam.
// Default ON for visitors with no stored preference.
const LOOP_SECONDS = 240;
const driftBtn = document.getElementById("driftBtn");
let drifting = localStorage.getItem("tars:drift") !== "off";
let driftFallback = 0;   // setTimeout id, armed only while drifting
let lastVideoTime = 0;   // wrap detection: a drop means the loop seam passed

function setDrift(on) {
  drifting = on;
  localStorage.setItem("tars:drift", on ? "on" : "off");
  driftBtn.textContent = on ? "◐ travel on" : "◐ travel off";
  driftBtn.classList.toggle("active", on);
  driftBtn.setAttribute("aria-pressed", String(on));
  clearTimeout(driftFallback);
  if (on) armDriftFallback();
}

// Load-error path only: if the video never becomes playable, the seam
// watcher never runs — advance on wall clock so drift still moves.
function armDriftFallback() {
  clearTimeout(driftFallback);
  driftFallback = setTimeout(() => {
    if (drifting && video.readyState < 2) advanceDrift();
  }, LOOP_SECONDS * 1000);
}

function advanceDrift() {
  const i = ROTATION_ORDER.indexOf(current.id);
  const nextId = ROTATION_ORDER[(i + 1) % ROTATION_ORDER.length];
  // Promote the preloader when it is already buffering the next city: the
  // switch costs no fetch, and the old frame holds until new frames draw.
  if (preloader.dataset.city === nextId && preloader.readyState >= 2) {
    const old = video;
    video = preloader;
    preloader = old;
    setCity(nextId, { user: false, preloaded: true });
  } else {
    setCity(nextId, { user: false });
  }
}

driftBtn.addEventListener("click", () => setDrift(!drifting));

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
}
addEventListener("resize", resize); resize();

function drawVideoFrame() {
  // Seam watcher: only while drifting, only once frames flow (readyState≥2
  // is also the guard against arming before the first frame). A drop in
  // currentTime is the loop wrapping — ride the seam to the next city.
  if (drifting && video.readyState >= 2) {
    const t = video.currentTime;
    if (lastVideoTime > 0 && t < lastVideoTime - 0.5) {
      advanceDrift(); // setCity resets lastVideoTime — don't overwrite it
    } else {
      lastVideoTime = t;
    }
  }
  if (video.readyState >= 2 && video.videoWidth) {
    const cw = canvas.width, ch = canvas.height;
    const vw = video.videoWidth, vh = video.videoHeight;
    const scale = Math.max(cw / vw, ch / vh);
    const w = vw * scale, h = vh * scale;
    ctx.drawImage(video, (cw - w) / 2, (ch - h) / 2, w, h);
    hasFrame = true;
  } else if (!hasFrame) {
    // First load only. After any frame has been shown the previous city
    // stays up while the next one buffers — no black screen between cities.
    ctx.fillStyle = "#07081a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9ba0cc"; ctx.font = `${14 * devicePixelRatio}px ui-sans-serif`;
    ctx.fillText("Loading loop…", 16 * devicePixelRatio, 28 * devicePixelRatio);
  }
  raf = requestAnimationFrame(drawVideoFrame);
}
raf = requestAnimationFrame(drawVideoFrame);

function setCity(id, { user = true, preloaded = false } = {}) {
  const c = CITIES.find(x => x.id === id) || CITIES[0];
  // A hand-picked city is a "stay here" — drift pauses (persisted) until
  // the listener turns it back on.
  if (user && drifting) setDrift(false);
  current = c;
  lastVideoTime = 0; // new video starts at 0 — never read as a wrap
  clearTimeout(driftFallback);
  if (drifting) armDriftFallback();
  if (!preloaded) {
    video.src = loopUrl(c); video.load();
  }
  video.dataset.city = c.id;
  video.play().catch(() => {});
  // The previous city stays on screen while this one buffers — the status
  // line says where we're headed ("taking you to…") until frames arrive.
  nowPlaying.textContent = `→ ${c.label}…`;
  video.onplaying = () => { nowPlaying.textContent = `${c.label} · 240s loop`; };
  for (const b of picker.querySelectorAll("button")) b.classList.toggle("active", b.dataset.city === c.id);
  history.replaceState(null, "", `#${c.id}`);
  document.title = `${c.label} · TARS DJ`;
  localStorage.setItem("tars:city", c.id);
  video.onerror = () => {
    // Keep the last good frame on screen; just say what happened.
    nowPlaying.textContent = `${c.label} — video still uploading. Stream still works.`;
  };
  // Warm the next city on the route so drift's seam switch is a promotion,
  // not a cold fetch.
  const nextId = ROTATION_ORDER[(ROTATION_ORDER.indexOf(c.id) + 1) % ROTATION_ORDER.length];
  if (preloader.dataset.city !== nextId) {
    preloader.dataset.city = nextId;
    preloader.src = loopUrl(CITIES.find(x => x.id === nextId));
    preloader.load();
  }
}

// Two columns, west half of the world on the left, east on the right.
function buildPicker() {
  for (const [label, cities] of [["← west", WEST], ["east →", EAST]]) {
    const col = document.createElement("div");
    col.className = "city-col";
    const h = document.createElement("span");
    h.className = "city-col-label";
    h.textContent = label;
    col.appendChild(h);
    for (const c of cities) {
      const b = document.createElement("button");
      b.textContent = c.label; b.dataset.city = c.id;
      b.addEventListener("click", () => setCity(c.id, { user: true }));
      col.appendChild(b);
    }
    picker.appendChild(col);
  }
}

async function initStream() {
  try {
    const r = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (r.ok) {
      const m = await r.json();
      const next = resolveStreamUrl(m.stream);
      if (next && next !== streamUrl) {
        const wasPaused = audio.paused;
        streamUrl = next;
        if (wasPaused) audio.src = streamUrl;
      }
    }
  } catch {}
  if (!audio.src) audio.src = streamUrl;
}

// --- Play/pause with AbortError tolerance ---
// "play() interrupted by pause()" is Chrome's AbortError when you click twice
// quickly, or when src is reassigned mid-play(). It's not a stream failure.
let playPending = false;

// --- Stream resilience (2026-11-24: "watching continuously, it often stops
// and stream has to be tapped again") ---
// A live MP3 over the open internet dies eventually — a network blip, a
// proxy recycling the connection, a phone sleeping. The <audio> element
// treats every one of those as terminal until someone taps play again. Only
// the user's own pause should be terminal; everything else reconnects with
// backoff against a FRESH url (a dead edge socket must never be reused).
let userPaused = false; // intent: the station is already playing on arrival
let reconnectTimer = 0;
let reconnectDelay = 2000;
let lastProgressAt = 0;

function scheduleReconnect(reason) {
  if (userPaused) return; // the user chose silence — never override intent
  clearTimeout(reconnectTimer);
  nowPlaying.textContent = `reconnecting… (${reason})`;
  reconnectTimer = setTimeout(reconnect, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
}

/** Every play() races a timeout: a stalled connection leaves the promise
 * pending forever, freezing whatever UI was waiting on it. */
function playWithTimeout(ms = 8000) {
  return Promise.race([
    audio.play(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("play timeout")), ms)),
  ]);
}

async function reconnect() {
  if (userPaused) return;
  try {
    const sep = streamUrl.includes("?") ? "&" : "?";
    audio.src = `${streamUrl}${sep}r=${Date.now()}`;
    audio.load();
    await playWithTimeout();
    reconnectDelay = 2000; // healthy again — reset backoff
    lastProgressAt = Date.now();
  } catch {
    scheduleReconnect("retry");
  }
}

playBtn.addEventListener("click", async () => {
  if (playPending) return;
  playPending = true;
  playBtn.disabled = true;
  try {
    if (audio.paused) {
      userPaused = false;
      reconnectDelay = 2000;
      playBtn.textContent = "◌ …"; // immediate feedback while the stream connects
      await playWithTimeout();
      lastProgressAt = Date.now();
      playBtn.textContent = "⏸︎ Pause";
      playBtn.setAttribute("aria-label", "Pause");
    } else {
      userPaused = true;
      clearTimeout(reconnectTimer);
      audio.pause();
      playBtn.textContent = "▶ Stream";
      playBtn.setAttribute("aria-label", "Play");
    }
  } catch (e) {
    // AbortError = interrupted by another play()/pause() — harmless, ignore
    if (e.name === "AbortError") {
      // leave button as-is, user can tap again
    } else {
      nowPlaying.textContent = `Stream blocked: ${e.message} — ${streamUrl}`;
      scheduleReconnect("blocked");
    }
  } finally {
    playPending = false;
    playBtn.disabled = false;
    // sync label to actual state (covers race where pause happened externally)
    if (!audio.paused && playBtn.textContent.startsWith("▶")) {
      playBtn.textContent = "⏸︎ Pause";
    }
  }
});

audio.addEventListener("playing", () => {
  lastProgressAt = Date.now();
  playBtn.textContent = "⏸︎ Pause";
  playBtn.setAttribute("aria-label", "Pause");
});
audio.addEventListener("pause", () => {
  if (!playPending) {
    playBtn.textContent = "▶ Stream";
    playBtn.setAttribute("aria-label", "Play");
  }
  if (!userPaused && !playPending) scheduleReconnect("paused");
});
audio.addEventListener("error", () => scheduleReconnect("stream error"));
audio.addEventListener("ended", () => scheduleReconnect("ended"));
audio.addEventListener("timeupdate", () => { lastProgressAt = Date.now(); });

// Watchdog: covers the cases that fire no event — a stalled socket that
// never errors, iOS suspending the element in the background.
setInterval(() => {
  if (userPaused || playPending) return;
  if (audio.paused) return scheduleReconnect("silent");
  if (lastProgressAt && Date.now() - lastProgressAt > 25_000) scheduleReconnect("stalled");
}, 10_000);

// Returning to the tab / regaining the network: recover immediately rather
// than waiting out the backoff.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !userPaused && audio.paused) reconnect();
});
addEventListener("online", () => {
  if (!userPaused && audio.paused) reconnect();
});

// Autoplay on arrival: the station is already running when you land.
// Unmuted play is allowed for visitors with media engagement (returning
// listeners); everyone else gets the always-allowed muted start, and the
// first tap anywhere unmutes. Either way the button reads Pause from the
// first frame — only a deliberate pause ever silences the station.
async function attemptAutoplay() {
  try {
    // Race the play promise: a stalled first connection can leave it
    // pending forever, which would skip the muted fallback entirely.
    await playWithTimeout();
    lastProgressAt = Date.now();
  } catch {
    audio.muted = true;
    try {
      await playWithTimeout();
      lastProgressAt = Date.now();
      const HINT = " · tap for sound";
      nowPlaying.textContent += HINT;
      const unmute = () => {
        audio.muted = false;
        nowPlaying.textContent = nowPlaying.textContent.replace(HINT, "");
      };
      addEventListener("pointerdown", unmute, { once: true });
      addEventListener("keydown", unmute, { once: true });
    } catch {
      /* even muted playback blocked — the Stream button stands by */
    }
  }
}

// Gesture safety net (iOS/Safari gate playback behind a user gesture): any
// interaction while we intend to be playing but aren't gets one more try.
const kickstart = () => {
  if (!userPaused && audio.paused) reconnect();
};
addEventListener("pointerdown", kickstart);
addEventListener("keydown", kickstart);

buildPicker();
initStream().then(attemptAutoplay);
const hash = location.hash.slice(1) || localStorage.getItem("tars:city") || "london";
setCity(CITIES.some(c=>c.id===hash) ? hash : CITIES[0].id, { user: false });
setDrift(drifting); // paint the toggle; arms the fallback when on

// Listener wish → the station's request pipeline. The QVAC LLM on the box
// rewrites the wish into the channel's lofi vocabulary; ACE-Step composes it;
// it airs within minutes. Raw text never reaches a generator.
const wishForm = document.getElementById("wishForm");
const wishInput = document.getElementById("wishInput");
const wishBtn = document.getElementById("wishBtn");
const wishNote = document.getElementById("wishNote");

// cid binds the human-clearance cookie to this browser (MEME.tg's shape:
// client-minted id in localStorage, sent with every write; the server signs
// clearance against it, so a stolen cookie fails for any other cid).
const cid =
  localStorage.getItem("tars:cid") ||
  (() => {
    const id = crypto.randomUUID();
    localStorage.setItem("tars:cid", id);
    return id;
  })();

// First-write Turnstile: the public sitekey rides on GET /api/prompt so this
// static page bakes no per-env keys. Reads are never gated.
let tsSiteKey = null;
fetch("/api/prompt")
  .then((r) => (r.ok ? r.json() : {}))
  .then((b) => {
    tsSiteKey = b.turnstile_site_key || null;
  })
  .catch(() => {});

const tsModal = document.getElementById("tsModal");
const tsWidget = document.getElementById("tsWidget");
let tsScriptLoading = null;
let tsWidgetId = null;

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  if (!tsScriptLoading) {
    tsScriptLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return tsScriptLoading;
}

// Credit fields persist like the cid — type them once, credited every time.
const wishName = document.getElementById("wishName");
const wishCountry = document.getElementById("wishCountry");
wishName.value = localStorage.getItem("tars:name") || "";
wishCountry.value = localStorage.getItem("tars:country") || "";

async function postWish(text, turnstileToken) {
  const name = sanitizeWishField(wishName.value, WISH_NAME_MAX);
  const country = sanitizeWishField(wishCountry.value, WISH_COUNTRY_MAX);
  text = sanitizeWishField(text, WISH_TEXT_MAX);
  localStorage.setItem("tars:name", name);
  localStorage.setItem("tars:country", country);
  const r = await fetch("/api/prompt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text,
      cid,
      ...(name ? { name } : {}),
      ...(country ? { country } : {}),
      ...(turnstileToken ? { turnstileToken } : {}),
    }),
  });
  const body = await r.json().catch(() => ({}));
  return { status: r.status, ok: r.ok, body };
}

// On-air credit: while a wish holds the air, the station credits its wisher.
const creditLine = document.getElementById("creditLine");
async function pollCredit() {
  try {
    const r = await fetch("/api/now", { cache: "no-store" });
    const { credit } = r.ok ? await r.json() : {};
    if (credit && credit.name) {
      creditLine.textContent = `☾ for ${credit.name}${credit.country ? ` from ${credit.country}` : ""}`;
      creditLine.hidden = false;
    } else {
      creditLine.hidden = true;
    }
  } catch {
    /* a missed poll hides nothing — the next one corrects */
  }
}
pollCredit();
setInterval(pollCredit, 30_000);

async function sendWish(text) {
  const first = await postWish(text);
  if (first.ok) return first;
  if (first.status === 403 && first.body.error === "turnstile") {
    // First write: challenge, then resend the SAME text with the token.
    // The solved token is never burned by a cheap reject — the server runs
    // every in-process gate before Siteverify. A 503 means Cloudflare is
    // down, not that the listener failed: no modal loop.
    if (!tsSiteKey) return first;
    tsModal.hidden = false;
    try {
      await loadTurnstileScript();
      if (tsWidgetId !== null) {
        window.turnstile.remove(tsWidgetId); // stale widget from an earlier challenge
        tsWidgetId = null;
      }
      const token = await new Promise((resolve, reject) => {
        tsWidgetId = window.turnstile.render(tsWidget, {
          sitekey: tsSiteKey,
          action: "wish",
          callback: resolve,
          "error-callback": () => reject(new Error("turnstile error")),
          "expired-callback": () => reject(new Error("turnstile expired")),
        });
      });
      window.turnstile.reset(tsWidgetId); // one-shot: never reattach a consumed token
      tsModal.hidden = true;
      if (!token) return first;
      return await postWish(text, token);
    } catch {
      tsModal.hidden = true;
      return first;
    }
  }
  return first;
}

wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = sanitizeWishField(wishInput.value, WISH_TEXT_MAX);
  if (text.length < 3) return;
  wishBtn.disabled = true;
  wishNote.textContent = "";
  try {
    const r = await sendWish(text);
    if (r.ok) {
      wishNote.textContent = "the station heard you — your wish shapes an upcoming track";
      wishInput.value = "";
    } else if (r.status === 503) {
      wishNote.textContent = "the human check is having a moment — try again shortly";
    } else {
      wishNote.textContent = r.body.error || "the station is busy — try again in a moment";
    }
  } catch {
    wishNote.textContent = "can't reach the station right now";
  } finally {
    wishBtn.disabled = false;
  }
});
