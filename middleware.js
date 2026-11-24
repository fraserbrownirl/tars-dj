// Vercel Edge: proxy /stream and /api/* to the box. Set TARS_UPSTREAM in project env
// (e.g. https://your-origin.example) — never commit the live upstream in git.
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
  const src = new URL(request.url);
  const origin = base.replace(/\/$/, "");
  const target = `${origin}${src.pathname}${src.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  return fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
}