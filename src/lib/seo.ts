import type { Locale } from "../i18n/utils";

const SITE = "https://www.sajconnect.com";

const OG_LOCALE: Record<Locale, string> = {
  de: "de_DE",
  en: "en_US",
  "pt-br": "pt_BR",
};

export interface SeoMeta {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  image?: string;
  type?: "website" | "article";
}

export function buildSeo(meta: SeoMeta) {
  const url = `${SITE}${meta.path}`;
  const ogImage = meta.image ?? `${SITE}/og-default.png`;

  return {
    canonical: url,
    ogLocale: OG_LOCALE[meta.locale],
    ogImage,
    ogType: meta.type ?? "website",
    title: meta.title,
    description: meta.description,
    siteName: "SAJ Connect",
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    legalName: "SAJ Connect GmbH",
    name: "SAJ Connect",
    url: SITE,
    logo: `${SITE}/logo.svg`,
    telephone: "+49-160-97533957",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Egensbach 310",
      postalCode: "91238",
      addressLocality: "Offenhausen",
      addressCountry: "DE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+49-160-97533957",
      url: `${SITE}/de/contact`,
      contactType: "customer support",
      availableLanguage: ["de", "en", "pt-BR"],
    },
    sameAs: [],
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SAJ Connect",
    url: SITE,
    inLanguage: OG_LOCALE[locale].replace("_", "-"),
  };
}
