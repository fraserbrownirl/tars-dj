export default {
  async fetch(req, env) {
    // Ephemeral unauthenticated-by-default relay: require the shared key
    // for its whole (short) lifetime. Deploy with RELAY_KEY secret_text.
    if (!env.RELAY_KEY || req.headers.get("x-relay-key") !== env.RELAY_KEY) {
      return new Response("nope", { status: 401 });
    }
    const url = new URL(req.url);
    const key = url.searchParams.get("key") || "";
    if (!key.startsWith("loops/") || key.includes("..")) {
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
        if (!uploadId || !partNumber) return Response.json({ ok: false, error: "bad part params" }, { status: 400 });
        const mpu = env.LOOPS.resumeMultipartUpload(key, uploadId);
        const part = await mpu.uploadPart(partNumber, await req.arrayBuffer());
        return Response.json({ partNumber, etag: part.etag });
      }
      if (url.pathname === "/complete" && req.method === "POST") {
        const { uploadId, parts } = await req.json();
        if (!uploadId || !Array.isArray(parts)) return Response.json({ ok: false, error: "bad complete body" }, { status: 400 });
        const sorted = [...parts].sort((a, b) => a.partNumber - b.partNumber);
        const mpu = env.LOOPS.resumeMultipartUpload(key, uploadId);
        await mpu.complete(sorted);
        return Response.json({ ok: true });
      }
      return new Response("not found", { status: 404 });
    } catch (e) {
      return Response.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
    }
  },
};
