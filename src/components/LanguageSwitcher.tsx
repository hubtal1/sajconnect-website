import { useState, useRef, useEffect } from "react";
import { LOCALES, type Locale, switchLocale } from "../i18n/utils";

const labels: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  "pt-br": "PT",
};

const fullLabels: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  "pt-br": "Português (BR)",
};

interface Props {
  currentLocale: Locale;
  pathname: string;
}

export default function LanguageSwitcher({ currentLocale, pathname }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const url = typeof window !== "undefined" ? new URL(window.location.href) : new URL(`https://www.sajconnect.com${pathname}`);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 border border-[var(--color-hairline-dark)] bg-transparent px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-text-on-carbon-muted)] transition-colors hover:border-[var(--color-cobalt-light)] hover:text-[var(--color-cobalt-light)]"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {labels[currentLocale]}
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 min-w-[180px] border border-[var(--color-hairline-dark)] bg-[var(--color-carbon)] py-1.5 backdrop-blur-md">
          {LOCALES.map((loc) => (
            <li key={loc}>
              <a
                href={switchLocale(url, loc)}
                className={`flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-[var(--color-carbon-soft)] ${
                  loc === currentLocale ? "text-[var(--color-cobalt-light)]" : "text-[var(--color-text-on-carbon-muted)] hover:text-[var(--color-bone)]"
                }`}
              >
                <span>{fullLabels[loc]}</span>
                <span className="font-mono text-xs tracking-[0.14em] text-[var(--color-text-on-carbon-faint)]">
                  {labels[loc]}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
