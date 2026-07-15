import { useEffect, useState } from "react";
import type { Locale } from "../i18n/utils";
import { getCountry, isUS } from "../lib/consent";

/**
 * CPRA-Pflichtlink für US-Besucher — für alle anderen unsichtbar.
 * Der Linktext ist gesetzlich vorgegeben und bleibt bewusst Englisch.
 */
export default function UsPrivacyLink({ locale }: { locale: Locale }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCountry().then((c) => {
      if (!cancelled && isUS(c)) setShow(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return (
    <p className="mt-3 text-sm">
      <a href={`/${locale}/do-not-sell`} className="hover:text-[var(--color-cobalt-light)]">
        Do Not Sell or Share My Personal Information
      </a>
    </p>
  );
}
