import { CITIES, loopUrl } from "./cities/index.js";

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

function buildPicker() {
  for (const c of CITIES) {
    const b = document.createElement("button");
    b.textContent = c.label; b.dataset.city = c.id;
    b.addEventListener("click", () => setCity(c.id));
    picker.appendChild(b);
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
const hash = location.hash.slice(1) || localStorage.getItem("tars:city") || CITIES[10].id;
setCity(CITIES.some(c=>c.id===hash) ? hash : CITIES[0].id);
