import type { Locale } from "../i18n/utils";

/**
 * Dossier document control block. Maintained deliberately:
 * bump `rev` and `validFrom` together when page content changes materially —
 * a document whose revision never moves while its date does is a fake.
 */
export const DOSSIER = {
  rev: "A",
  validFrom: "2026-07-09",
} as const;

const DATE_LOCALES: Record<Locale, string> = {
  de: "de-DE",
  en: "en-US",
  "pt-br": "pt-BR",
};

export function formatDossierDate(iso: string, locale: Locale): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(DATE_LOCALES[locale], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}
