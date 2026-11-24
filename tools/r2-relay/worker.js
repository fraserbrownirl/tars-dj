const LOOP_KEY = /^loops\/[\w.\-]+\.mp4$/;
const MAX_PART_BYTES = 50 * 1024 * 1024;
const MAX_PART_NUMBER = 10_000;
const MAX_PARTS_IN_COMPLETE = 10_000;

export default {
  async fetch(req, env) {
    if (!env.RELAY_KEY) {
      return new Response("nope", { status: 401 });
    }
    const supplied = req.headers.get("x-relay-key") ?? "";
    if (!safeEqual(supplied, env.RELAY_KEY)) {
      return new Response("nope", { status: 401 });
    }
    const url = new URL(req.url);
    const key = url.searchParams.get("key") || "";
    if (!LOOP_KEY.test(key)) {
      return new Response("bad key", { status: 400 });
    }
    try {
      if (url.pathname === "/init" && req.method === "POST") {
        const mpu = await env.LOOPS.createMultipartUpload(key, {
          httpMetadata: { contentType: "video/mp4" },
        });
        return Response.json({ uploadId: mpu.uploadId });
      }
      if (url.pathname === "/part" && req.method === "POST") {
        const uploadId = url.searchParams.get("uploadId") || "";
        const partNumber = Number(url.searchParams.get("partNumber"));
        if (!uploadId || !validPartNumber(partNumber)) {
          return Response.json({ ok: false, error: "bad part params" }, { status: 400 });
        }
        const len = Number(req.headers.get("content-length"));
        if (!Number.isFinite(len) || len <= 0 || len > MAX_PART_BYTES) {
          return new Response("part too large", { status: 413 });
        }
        const mpu = env.LOOPS.resumeMultipartUpload(key, uploadId);
        const part = await mpu.uploadPart(partNumber, await req.arrayBuffer());
        return Response.json({ partNumber, etag: part.etag });
      }
      if (url.pathname === "/complete" && req.method === "POST") {
        const clen = Number(req.headers.get("content-length"));
        if (Number.isFinite(clen) && clen > 512 * 1024) {
          return new Response("complete body too large", { status: 413 });
        }
        const { uploadId, parts } = await req.json();
        if (!uploadId || !Array.isArray(parts) || parts.length > MAX_PARTS_IN_COMPLETE) {
          return Response.json({ ok: false, error: "bad complete body" }, { status: 400 });
        }
        for (const p of parts) {
          if (!p || !validPartNumber(p.partNumber) || typeof p.etag !== "string" || !p.etag) {
            return Response.json({ ok: false, error: "bad part entry" }, { status: 400 });
          }
        }
        const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
        const mpu = env.LOOPS.resumeMultipartUpload(key, uploadId);
        await mpu.complete(sorted);
        return Response.json({ ok: true });
      }
      return new Response("not found", { status: 404 });
    } catch {
      return Response.json({ ok: false, error: "upload_failed" }, { status: 500 });
    }
  },
};

function validPartNumber(n) {
  return Number.isInteger(n) && n >= 1 && n <= MAX_PART_NUMBER;
}

function safeEqual(a, b) {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < ab.byteLength; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}