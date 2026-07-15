/**
 * Cloudflare Worker: statische Assets + Kontaktformular-API.
 *
 * POST /api/contact  — validiert die Anfrage und versendet sie per
 * Microsoft Graph (Client-Credentials) über das firmeneigene M365.
 *
 * Benötigte Secrets/Variablen (Worker → Settings → Variables and Secrets):
 *   AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET  (Secrets)
 *   MAIL_SENDER  z. B. noreply@sajconnect.com  (Absender-Postfach, muss existieren)
 *   MAIL_TO      z. B. info@sajconnect.com     (Empfänger)
 */

const ALLOWED_ORIGINS = [
  "sajconnect.com",
  "www.sajconnect.com",
  "sajconnect-website.sebastian-schweiger.workers.dev",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function clip(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

async function getGraphToken(env) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.AZURE_CLIENT_ID,
    client_secret: env.AZURE_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
  });
  const r = await fetch(
    `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
  );
  if (!r.ok) {
    console.error("Graph token request failed", r.status, await r.text().catch(() => ""));
    return null;
  }
  const d = await r.json();
  return d.access_token || null;
}

async function handleContact(request, env) {
  // Nur eigene Seiten dürfen posten.
  const origin = request.headers.get("Origin");
  if (origin) {
    let host = "";
    try {
      host = new URL(origin).hostname;
    } catch {
      /* ungültiger Origin-Header */
    }
    if (!ALLOWED_ORIGINS.includes(host)) return json({ error: "forbidden" }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  // Honeypot: Bots füllen das unsichtbare Feld — still verwerfen.
  if (body.website) return json({ ok: true });

  const name = clip(body.name, 200);
  const email = clip(body.email, 200);
  const company = clip(body.company, 200);
  const message = clip(body.message, 5000);

  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10 || body.consent !== true) {
    return json({ error: "validation" }, 400);
  }

  if (!env.AZURE_TENANT_ID || !env.AZURE_CLIENT_ID || !env.AZURE_CLIENT_SECRET || !env.MAIL_SENDER || !env.MAIL_TO) {
    console.error("Kontakt-API: Mailversand nicht konfiguriert (Secrets fehlen)");
    return json({ error: "not_configured" }, 503);
  }

  const token = await getGraphToken(env);
  if (!token) return json({ error: "upstream" }, 502);

  const mail = {
    message: {
      subject: `Kontaktanfrage Website: ${name}`,
      body: {
        contentType: "Text",
        content:
          `Neue Anfrage über das Kontaktformular www.sajconnect.com\n\n` +
          `Name: ${name}\nE-Mail: ${email}\nUnternehmen: ${company || "—"}\n\n` +
          `Nachricht:\n${message}\n`,
      },
      toRecipients: [{ emailAddress: { address: env.MAIL_TO } }],
      replyTo: [{ emailAddress: { address: email } }],
    },
    saveToSentItems: false,
  };

  const r = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.MAIL_SENDER)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(mail),
    }
  );

  if (r.status !== 202) {
    console.error("Graph sendMail failed", r.status, await r.text().catch(() => ""));
    return json({ error: "send_failed" }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      return handleContact(request, env);
    }
    if (url.pathname === "/api/geo") {
      // Besucherland für die Geo-Consent-Logik (EU Opt-in / US Opt-out).
      // CF-IPCountry ist nur server-seitig lesbar — hier reichen wir es durch.
      const country = request.cf?.country || request.headers.get("CF-IPCountry") || "XX";
      return new Response(JSON.stringify({ country }), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    // Alles andere: statische Website.
    return env.ASSETS.fetch(request);
  },
};
