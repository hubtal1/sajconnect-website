import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://www.sajconnect.com";

export default defineConfig({
  site: SITE,
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "de",
        locales: {
          de: "de-DE",
          en: "en-US",
          "pt-br": "pt-BR",
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
