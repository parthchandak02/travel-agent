// Optional password page for a published trip explorer (Cloudflare Pages advanced mode).
// publish-trip-explorer.sh copies this file into the trip folder before deploying.
// Set the password as a Pages secret:  npx wrangler pages secret put SITE_PASSWORD --project-name <project>
// With no SITE_PASSWORD set, the site is served openly, exactly as before.
const COOKIE = "trip_gate";
const MAX_AGE = 30 * 24 * 3600;

async function token(password) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`trip-gate:${password}`),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("ok"));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, c => ({ "+": "-", "/": "_", "=": "" }[c]));
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function safeNext(n) {
  return typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/";
}

function page(status, msg, next) {
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Password</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.4 system-ui,sans-serif;background:#f6f6f4;color:#222}
@media(prefers-color-scheme:dark){body{background:#111;color:#eee}input{background:#1c1c1c;color:#eee;border-color:#333}}
form{display:grid;gap:12px;width:min(320px,86vw)}input,button{font:inherit;padding:12px 14px;border-radius:10px;border:1px solid #ccc}
button{background:#222;color:#fff;border:0;cursor:pointer}p{margin:0}.e{color:#c0392b;font-size:14px}</style>
<form method="post" action="/__gate/login"><p>Enter the password</p>
<input type="password" name="password" autocomplete="current-password" placeholder="Password" autofocus required aria-label="Password">
<input type="hidden" name="next" value="${esc(next)}"><button>Open</button>${msg ? `<p class="e">${esc(msg)}</p>` : ""}</form>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

export default {
  async fetch(request, env) {
    const password = (env.SITE_PASSWORD || "").trim();
    if (!password) return env.ASSETS.fetch(request);

    const url = new URL(request.url);
    const good = await token(password);

    if (url.pathname === "/__gate/login" && request.method === "POST") {
      const form = await request.formData();
      const next = safeNext(form.get("next"));
      if (!same(String(form.get("password") || ""), password)) {
        await new Promise(r => setTimeout(r, 800));   // slow down guessing
        return page(401, "Wrong password.", next);
      }
      return new Response(null, { status: 303, headers: {
        location: next, "cache-control": "no-store",
        "set-cookie": `${COOKIE}=${good}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax` } });
    }
    if (url.pathname === "/__gate/logout") {
      return new Response(null, { status: 303, headers: { location: "/", "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
    }

    const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
    if (m && same(m[1], good)) return env.ASSETS.fetch(request);
    return page(401, "", url.pathname + url.search);
  },
};
