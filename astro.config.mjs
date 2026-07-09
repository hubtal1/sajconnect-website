import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";

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
    server: {
      fs: {
        // Allow serving through directory junctions (dev is sometimes started
        // via a junction path, which makes Vite see files as outside the root).
        allow: [fileURLToPath(new URL(".", import.meta.url)), realpathSync(fileURLToPath(new URL(".", import.meta.url)))],
      },
    },
  },
});
