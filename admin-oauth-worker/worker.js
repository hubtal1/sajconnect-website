/**
 * Decap CMS OAuth proxy — Cloudflare Worker
 *
 * Acts as the OAuth go-between for GitHub authentication so editors can sign
 * in to /admin/ on www.sajconnect.com without exposing OAuth secrets to the
 * browser.
 *
 * Deploy:
 *   1. cd admin-oauth-worker
 *   2. npx wrangler deploy
 *   3. Add secrets:
 *        npx wrangler secret put GITHUB_CLIENT_ID
 *        npx wrangler secret put GITHUB_CLIENT_SECRET
 *   4. Point public/admin/config.yml `backend.base_url` at the worker URL.
 *
 * Endpoints:
 *   GET  /auth          → starts OAuth flow, redirects to GitHub
 *   GET  /callback      → receives GitHub code, exchanges for token, posts
 *                         the token back to the opener via window.postMessage
 */

const ALLOWED_ORIGINS = [
  "https://www.sajconnect.com",
  "https://sajconnect.com",
  "https://sajconnect-website.pages.dev",
  "http://localhost:4321",
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") {
      const state = crypto.randomUUID();
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: "repo,user",
        state,
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params}`,
        302,
      );
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "SAJ-Decap-OAuth-Worker",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        },
      );

      const data = await tokenRes.json();
      const token = data.access_token;

      const message = token
        ? { type: "authorization:github:success", token }
        : { type: "authorization:github:error", error: data };

      const allowedOrigins = JSON.stringify(ALLOWED_ORIGINS);
      const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Auth complete</title></head>
<body><script>
(function() {
  var allowed = ${allowedOrigins};
  var msg = 'authorization:github:' + (${token ? "'success'" : "'error'"}) + ':' + ${JSON.stringify(JSON.stringify(message))};
  function send(target) {
    if (!target) return;
    for (var i = 0; i < allowed.length; i++) {
      target.postMessage(msg, allowed[i]);
    }
  }
  send(window.opener);
  setTimeout(function() { window.close(); }, 1000);
  document.body.innerHTML = '<p style="font-family:system-ui;padding:24px;color:#f2efe9;background:#07080b;">${token ? "Anmeldung erfolgreich. Dieses Fenster kann geschlossen werden." : "Anmeldung fehlgeschlagen."}</p>';
})();
</script></body></html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
        status: 200,
      });
    }

    return new Response(
      "Decap OAuth Proxy — endpoints: /auth, /callback",
      {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  },
};
