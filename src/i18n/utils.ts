import de from "./de.json";
import en from "./en.json";
import ptBr from "./pt-br.json";

export const LOCALES = ["de", "en", "pt-br"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

const dictionaries: Record<Locale, unknown> = {
  de,
  en,
  "pt-br": ptBr,
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function getLocaleFromUrl(url: URL): Locale {
  const seg = url.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return isLocale(seg) ? seg : DEFAULT_LOCALE;
}

export function t(locale: Locale): (key: string) => string {
  const dict = dictionaries[locale] as Record<string, unknown>;
  return (key: string) => {
    const parts = key.split(".");
    let cur: unknown = dict;
    for (const part of parts) {
      if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof cur === "string" ? cur : key;
  };
}

export function getDict<T = unknown>(locale: Locale, key: string): T {
  const dict = dictionaries[locale] as Record<string, unknown>;
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined as T;
    }
  }
  return cur as T;
}

export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

export function switchLocale(currentUrl: URL, target: Locale): string {
  const segments = currentUrl.pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = target;
  } else {
    segments.unshift(target);
  }
  return "/" + segments.join("/");
}
