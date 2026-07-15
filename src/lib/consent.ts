/**
 * Geo-abhängige Consent-Logik (EU Opt-in / US Opt-out, CPRA).
 *
 * - Das Besucherland kommt vom Worker-Endpoint /api/geo (CF-IPCountry ist nur
 *   server-seitig lesbar). Fehler/unbekannt => "XX" => strengste Regel (Opt-in).
 * - Debug-Override zum Testen: ?geo=US an eine beliebige URL hängen.
 * - Marketing-Skripte laden NUR über loadMarketingScripts(). Solange
 *   GA_MEASUREMENT_ID leer ist, ist das ein No-op — die Website setzt dann
 *   keinerlei Marketing-/Analyse-Cookies (Stand heute gewollt).
 * - Global Privacy Control (GPC) zählt unter CPRA als Widerspruch und wird
 *   respektiert.
 */

/** Google-Analytics-Mess-ID. Leer lassen = kein Tracking (aktueller Zustand).
 *  Zum Aktivieren hier z. B. "G-XXXXXXXXXX" eintragen UND die
 *  Datenschutzerklärung um Google Analytics erweitern. */
export const GA_MEASUREMENT_ID = "";

export const EU_CONSENT_KEY = "saj_cookie_consent_v1";
export const US_OPTOUT_KEY = "saj_us_optout";

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
  interface Window {
    dataLayer?: unknown[];
    __sajMarketingLoaded?: boolean;
  }
}

let countryPromise: Promise<string> | null = null;

/** Override nur auf Test-Hosts — auf sajconnect.com könnte sonst ein
 *  präparierter ?geo=US-Link EU-Besuchern den Opt-in-Schutz nehmen. */
function geoOverrideAllowed(): boolean {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".workers.dev");
}

/** Besucherland (ISO-2, z. B. "US", "DE"), gecached pro Seitenaufruf. */
export function getCountry(): Promise<string> {
  // Debug-/Test-Override: ?geo=US — NICHT auf der Produktions-Domain.
  try {
    const forced = new URLSearchParams(window.location.search).get("geo");
    if (forced && /^[A-Za-z]{2}$/.test(forced) && geoOverrideAllowed()) {
      return Promise.resolve(forced.toUpperCase());
    }
  } catch {
    /* kein window (SSR) */
  }
  if (!countryPromise) {
    countryPromise = fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : { country: "XX" }))
      .then((d: { country?: string }) => d.country || "XX")
      .catch(() => "XX");
  }
  return countryPromise;
}

export function isUS(country: string): boolean {
  return country === "US";
}

/** GPC-Browsersignal — rechtlich bindendes Opt-out unter CPRA. */
export function hasGpcSignal(): boolean {
  try {
    return navigator.globalPrivacyControl === true;
  } catch {
    return false;
  }
}

export function usOptedOut(): boolean {
  try {
    return localStorage.getItem(US_OPTOUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setUsOptOut(optOut: boolean): void {
  try {
    if (optOut) localStorage.setItem(US_OPTOUT_KEY, "1");
    else localStorage.removeItem(US_OPTOUT_KEY);
  } catch {
    /* storage nicht verfügbar */
  }
  // Bereits geladene GA-Instanz sofort stoppen/freigeben — wichtig in der
  // SPA-Navigation (ClientRouter), wo bis zum nächsten Full-Reload sonst
  // weitergetrackt würde. Offizieller GA-Kill-Switch:
  if (GA_MEASUREMENT_ID) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = optOut;
  }
}

export function euConsentAccepted(): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(EU_CONSENT_KEY) || "null") as {
      consent?: string;
    } | null;
    return stored?.consent === "accept";
  } catch {
    return false;
  }
}

/** Dürfen Marketing-/Analyse-Skripte für dieses Land laden? */
export function marketingAllowed(country: string): boolean {
  if (isUS(country)) {
    // US: Opt-out-Prinzip — laden, außer Nutzer (oder GPC) widerspricht.
    return !hasGpcSignal() && !usOptedOut();
  }
  // EU + Rest der Welt + unbekannt: Opt-in-Prinzip.
  return euConsentAccepted();
}

/** Lädt die Marketing-Skripte genau einmal. No-op ohne GA_MEASUREMENT_ID.
 *  Hinweis für die Aktivierung: die Website navigiert als SPA (ClientRouter) —
 *  für Folgeseiten muss dann zusätzlich ein astro:page-load-Listener
 *  page_view-Events nachfeuern, sonst zählt GA nur den ersten Aufruf. */
export function loadMarketingScripts(): void {
  if (!GA_MEASUREMENT_ID) return;
  if (window.__sajMarketingLoaded) return;
  window.__sajMarketingLoaded = true;

  const s = document.createElement("script");
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  s.async = true;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  // gtag.js verlangt exakt dieses Muster: das arguments-Objekt (KEIN Array)
  // in den dataLayer pushen — Array-Pushes ignoriert GA stillschweigend.
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
  // @ts-expect-error gtag nutzt bewusst das arguments-Objekt statt Parametern
  gtag("js", new Date());
  // @ts-expect-error s. o.
  gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}
