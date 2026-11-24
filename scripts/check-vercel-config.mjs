#!/usr/bin/env node
/** Fail CI/deploy prep when TARS_UPSTREAM is unset (Vercel middleware + local proxy). */
const raw = process.env.TARS_UPSTREAM?.trim();
if (!raw) {
  console.error("TARS_UPSTREAM is not set (see README Deploy).");
  process.exit(1);
}
try {
  const u = new URL(raw);
  if (u.protocol !== "https:") {
    console.error("TARS_UPSTREAM must be https://");
    process.exit(1);
  }
} catch {
  console.error("TARS_UPSTREAM is not a valid URL");
  process.exit(1);
}
console.log("TARS_UPSTREAM ok:", new URL(raw).origin);