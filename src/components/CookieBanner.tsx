import { useEffect, useState } from "react";
import deRaw from "../i18n/de.json";
import enRaw from "../i18n/en.json";
import ptRaw from "../i18n/pt-br.json";
import type { Locale } from "../i18n/utils";
import {
  EU_CONSENT_KEY,
  euConsentAccepted,
  getCountry,
  isUS,
  loadMarketingScripts,
  marketingAllowed,
} from "../lib/consent";

const dicts = { de: deRaw, en: enRaw, "pt-br": ptRaw } as const;

export default function CookieBanner({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const country = await getCountry();
      if (cancelled) return;

      if (isUS(country)) {
        // USA: Opt-out-Prinzip (CPRA) — kein EU-Banner. Marketing lädt sofort,
        // außer der Nutzer hat widersprochen oder sein Browser sendet GPC.
        if (marketingAllowed(country)) loadMarketingScripts();
        return;
      }

      // EU + Rest: Opt-in-Prinzip — ohne gespeicherte Entscheidung blockieren.
      if (euConsentAccepted()) {
        loadMarketingScripts();
        return;
      }
      try {
        const stored = localStorage.getItem(EU_CONSENT_KEY);
        if (!stored) setVisible(true);
      } catch {
        setVisible(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function decide(consent: "accept" | "decline") {
    try {
      localStorage.setItem(
        EU_CONSENT_KEY,
        JSON.stringify({ consent, at: new Date().toISOString() }),
      );
    } catch {
      // ignore
    }
    if (consent === "accept") loadMarketingScripts();
    setVisible(false);
  }

  if (!visible) return null;

  const t = dicts[locale].cookie;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.headline}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:px-6 md:pb-6"
    >
      <div className="mx-auto max-w-3xl border border-[var(--color-hairline-dark)] bg-[var(--color-carbon-soft)]/95 p-6 backdrop-blur-lg md:p-7">
        <div className="flex items-center gap-2">
          <span
            className="block h-1.5 w-1.5 rounded-full bg-[var(--color-cobalt-light)]"
            style={{ boxShadow: "0 0 12px rgba(36,64,240,0.6)" }}
          ></span>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-cobalt-light)]">
            Privacy
          </p>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-[var(--color-bone)]">
          {t.headline}
        </h3>
        <p className="mt-3 text-sm text-[var(--color-text-on-carbon-muted)]">{t.text}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => decide("decline")}
            className="btn btn-ghost !py-2 !px-4 text-sm"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => decide("accept")}
            className="btn btn-primary !py-2 !px-4 text-sm"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
