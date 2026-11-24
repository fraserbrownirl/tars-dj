// Vercel Edge: proxy /stream and /api/* to the box. Set TARS_UPSTREAM in project env
// (e.g. https://your-origin.example) — never commit the live upstream in git.
// TARS_ORIGIN_KEY (project env) is the shared key the origin's Caddy requires on
// /api/* — it is what makes the origin answer only to this deployment, and what
// makes X-Forwarded-For (hence per-listener rate limits) trustworthy.
export const config = {
  matcher: ["/stream", "/api/:path*"],
};

export default async function middleware(request) {
  const base = process.env.TARS_UPSTREAM;
  if (!base) {
    return new Response(
      JSON.stringify({ error: "upstream_not_configured" }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  let origin;
  try {
    origin = new URL(base).origin;
  } catch {
    return new Response(
      JSON.stringify({ error: "upstream_misconfigured" }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  const src = new URL(request.url);
  const target = `${origin}${src.pathname}${src.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  const originKey = process.env.TARS_ORIGIN_KEY;
  if (originKey) headers.set("x-tars-origin-key", originKey);

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    // Required when forwarding a streaming Request body on modern fetch.
    init.duplex = "half";
  }

  return fetch(target, init);
}