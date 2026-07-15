import { useEffect, useState } from "react";
import deRaw from "../i18n/de.json";
import enRaw from "../i18n/en.json";
import ptRaw from "../i18n/pt-br.json";
import type { Locale } from "../i18n/utils";
import { hasGpcSignal, setUsOptOut, usOptedOut } from "../lib/consent";

const dicts = { de: deRaw, en: enRaw, "pt-br": ptRaw } as const;

/** Interaktiver CPRA-Opt-out-Schalter (Seite /do-not-sell). */
export default function OptOutToggle({ locale }: { locale: Locale }) {
  const t = dicts[locale].usPrivacy;
  const [optedOut, setOptedOut] = useState(false);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    setOptedOut(usOptedOut());
    setGpc(hasGpcSignal());
  }, []);

  function toggle() {
    const next = !optedOut;
    setUsOptOut(next);
    setOptedOut(next);
  }

  const active = optedOut || gpc;

  return (
    <div className="mt-10 border-t border-[var(--color-hairline-dark)] pt-8">
      <p className="mono-label-sm text-[var(--color-text-on-carbon-faint)]">{t.currentState}</p>
      <p className="mt-3 flex items-center gap-2.5 text-base text-[var(--color-bone)]">
        <span
          className={`block h-2 w-2 rounded-full ${active ? "bg-[var(--color-saj-green-bright)]" : "bg-[var(--color-amber)]"}`}
          aria-hidden="true"
        ></span>
        <span>{active ? t.statusOptedOut : t.statusNotOptedOut}</span>
      </p>
      {gpc && (
        <p className="mt-3 max-w-[62ch] text-sm text-[var(--color-text-on-carbon-muted)]">{t.statusGpc}</p>
      )}
      {!gpc && (
        <button type="button" onClick={toggle} className="btn btn-primary mt-6 !px-5 !py-2.5 text-sm">
          {optedOut ? t.optInBtn : t.optOutBtn}
        </button>
      )}
    </div>
  );
}
