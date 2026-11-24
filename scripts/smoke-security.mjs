#!/usr/bin/env node
/**
 * Offline smoke checks for audit remediations (no network).
 * Run: node scripts/smoke-security.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// --- stream allowlist (mirror src/main.js) ---
function allowedStreamHosts(hostname = "tars.dj") {
  return new Set([hostname, "tars.dj", "www.tars.dj"]);
}
function resolveStreamUrl(raw, hostname = "tars.dj") {
  const DEFAULT = "https://tars.dj/stream";
  if (!raw || typeof raw !== "string") return DEFAULT;
  try {
    const u = new URL(raw, `https://${hostname}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return DEFAULT;
    if (!allowedStreamHosts(hostname).has(u.hostname)) return DEFAULT;
    return u.href;
  } catch {
    return DEFAULT;
  }
}

assert.equal(resolveStreamUrl("https://evil.example/x"), "https://tars.dj/stream");
assert.equal(resolveStreamUrl("javascript:alert(1)"), "https://tars.dj/stream");
assert.equal(resolveStreamUrl("https://tars.dj/stream"), "https://tars.dj/stream");
assert.equal(resolveStreamUrl("https://www.tars.dj/stream"), "https://www.tars.dj/stream");

function sanitizeWishField(value, maxLen) {
  const collapsed = String(value).replace(/[\r\n\u2028\u2029]+/g, " ").trim();
  return collapsed.length <= maxLen ? collapsed : collapsed.slice(0, maxLen);
}
assert.equal(sanitizeWishField("a\nb", 120), "a b");
assert.equal(sanitizeWishField("x".repeat(200), 120).length, 120);

// --- vercel.json: no upstream host, has frame isolation ---
const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
assert.ok(!("rewrites" in vercel) || !JSON.stringify(vercel.rewrites || []).includes("sslip"));
const headerBlob = JSON.stringify(vercel.headers || []);
assert.match(headerBlob, /frame-ancestors/);
assert.match(headerBlob, /X-Frame-Options/);
assert.match(headerBlob, /script-src/);
assert.match(headerBlob, /media-src/);
assert.match(headerBlob, /pub-f443cfa20d11480ba421991226fd803c\.r2\.dev/);
assert.match(headerBlob, /challenges\.cloudflare\.com/);
assert.doesNotMatch(headerBlob, /access-control-allow-origin","value":"\*"/i);

// The middleware must present the origin-lockdown key, or the origin 404s /api/*.
const middlewareSrc = readFileSync(join(root, "middleware.js"), "utf8");
assert.match(middlewareSrc, /TARS_ORIGIN_KEY/);
assert.match(middlewareSrc, /x-tars-origin-key/);

// --- middleware present ---
const mw = readFileSync(join(root, "middleware.js"), "utf8");
assert.match(mw, /TARS_UPSTREAM/);
assert.doesNotMatch(mw, /45\.148|sslip\.io/);

// --- relay worker gates ---
const worker = readFileSync(join(root, "tools/r2-relay/worker.js"), "utf8");
assert.match(worker, /Number\.isInteger/);
assert.match(worker, /MAX_PART_BYTES/);
assert.match(worker, /upload_failed/);
assert.match(worker, /LOOP_KEY/);
assert.doesNotMatch(worker, /e\.message/);

// --- gitignore tracks ops docs ---
const gi = readFileSync(join(root, ".gitignore"), "utf8");
assert.match(gi, /HANDOVER\.md/);
assert.match(gi, /DRAFT-README\.md/);

console.log("smoke-security: ok");
