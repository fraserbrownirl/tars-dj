import { CITIES, WEST, EAST, loopUrl } from "./cities/index.js";

const MANIFEST_URL = "/manifest.json";
const DEFAULT_STREAM = "https://tars.dj/stream";
const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d", { alpha: false });
const picker = document.getElementById("cityPicker");
const audio = document.getElementById("stream");
const playBtn = document.getElementById("playBtn");
const nowPlaying = document.getElementById("nowPlaying");

let current = CITIES[0];
let video = document.createElement("video");
video.loop = true; video.muted = true; video.playsInline = true;
video.preload = "auto";
let raf = 0, streamUrl = DEFAULT_STREAM;

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
}
addEventListener("resize", resize); resize();

function drawVideoFrame() {
  if (video.readyState >= 2 && video.videoWidth) {
    const cw = canvas.width, ch = canvas.height;
    const vw = video.videoWidth, vh = video.videoHeight;
    const scale = Math.max(cw / vw, ch / vh);
    const w = vw * scale, h = vh * scale;
    ctx.drawImage(video, (cw - w) / 2, (ch - h) / 2, w, h);
  } else {
    ctx.fillStyle = "#07081a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9ba0cc"; ctx.font = `${14 * devicePixelRatio}px ui-sans-serif`;
    ctx.fillText("Loading loop…", 16 * devicePixelRatio, 28 * devicePixelRatio);
  }
  raf = requestAnimationFrame(drawVideoFrame);
}
raf = requestAnimationFrame(drawVideoFrame);

function setCity(id) {
  const c = CITIES.find(x => x.id === id) || CITIES[0];
  current = c;
  const url = loopUrl(c);
  video.src = url; video.load(); video.play().catch(() => {});
  nowPlaying.textContent = `${c.label} · 240s loop`;
  for (const b of picker.querySelectorAll("button")) b.classList.toggle("active", b.dataset.city === c.id);
  history.replaceState(null, "", `#${c.id}`);
  document.title = `${c.label} · TARS DJ`;
  localStorage.setItem("tars:city", c.id);
  video.onerror = () => {
    nowPlaying.textContent = `${c.label} — video still uploading. Stream still works.`;
    ctx.fillStyle = "#07081a"; ctx.fillRect(0,0,canvas.width,canvas.height);
  };
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
      b.addEventListener("click", () => setCity(c.id));
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
      if (m.stream && m.stream !== streamUrl) {
        // Only re-assign if changed and not already playing (avoids interrupting a pending play())
        const wasPaused = audio.paused;
        streamUrl = m.stream;
        if (wasPaused && !audio.src) audio.src = streamUrl;
        else if (wasPaused) audio.src = streamUrl;
      }
    }
  } catch {}
  if (!audio.src) audio.src = streamUrl;
}

// --- Play/pause with AbortError tolerance ---
// "play() interrupted by pause()" is Chrome's AbortError when you click twice
// quickly, or when src is reassigned mid-play(). It's not a stream failure.
let playPending = false;

playBtn.addEventListener("click", async () => {
  if (playPending) return;
  playPending = true;
  playBtn.disabled = true;
  try {
    if (audio.paused) {
      await audio.play();
      playBtn.textContent = "⏸︎ Pause";
      playBtn.setAttribute("aria-label", "Pause");
    } else {
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
  playBtn.textContent = "⏸︎ Pause";
  playBtn.setAttribute("aria-label", "Pause");
});
audio.addEventListener("pause", () => {
  if (!playPending) {
    playBtn.textContent = "▶ Stream";
    playBtn.setAttribute("aria-label", "Play");
  }
});
audio.addEventListener("error", () => {
  nowPlaying.textContent = `Stream error — check ${streamUrl}`;
});

buildPicker();
initStream();
const hash = location.hash.slice(1) || localStorage.getItem("tars:city") || "london";
setCity(CITIES.some(c=>c.id===hash) ? hash : CITIES[0].id);

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
  const name = wishName.value.trim();
  const country = wishCountry.value.trim();
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
  const text = wishInput.value.trim();
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
