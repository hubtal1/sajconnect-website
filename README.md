# SAJ Connect — www.sajconnect.com

Public marketing website for SAJ Connect, built with Astro 5, TailwindCSS 4 and Cloudflare Pages.

## Stack

- **Astro 5** (static-output, islands architecture)
- **TailwindCSS 4** + custom design tokens (Anthropic-inspired warm cream + SAJ blue + coral)
- **React 19** islands for interactivity (cookie banner, language switcher, contact form)
- **Cantarell** webfont (locally served, no Google Fonts)
- **MDX** content collections for blog and job listings
- **Cloudflare Pages** for deployment + DNS + SSL + DDoS + WAF
- **eRecht24 Premium** for legal text generation (separate booking)

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # outputs ./dist
npm run preview      # serves the built site locally
npm run check        # astro check (TypeScript + content schema)
```

## Project structure

```
src/
├── content/           # MDX collections (jobs, blog) + Zod schemas
├── i18n/              # de.json, en.json, pt-br.json + utils
├── layouts/           # Layout.astro
├── components/        # Header, Footer, Hero, ServiceGrid, CtaBanner, CookieBanner, ContactForm, LanguageSwitcher
├── pages/
│   ├── index.astro            # root → /de/
│   └── [lang]/                # all locale pages
│       ├── index.astro        # home
│       ├── about.astro
│       ├── services.astro
│       ├── careers/
│       │   ├── index.astro
│       │   └── [slug].astro
│       ├── blog/
│       │   ├── index.astro
│       │   └── [slug].astro
│       ├── contact.astro
│       ├── imprint.astro
│       └── privacy.astro
├── styles/global.css  # Tailwind theme + design tokens
└── lib/seo.ts         # OG / Schema.org helpers

public/
├── _headers           # Cloudflare Pages security headers
├── _redirects         # SPA + translated-slug aliases
├── favicon.svg
└── robots.txt
```

## Deployment (Cloudflare Pages)

1. Push to GitHub repo `sajconnect-website` (separate from ERP repo).
2. In Cloudflare Pages dashboard: **Create project → Connect to Git → select repo**.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20
4. **Production branch:** `main` → live at `www.sajconnect.com`.
5. Other branches → automatic preview URLs at `*.sajconnect-website.pages.dev`.

### DNS / Custom domain

1. Move `sajconnect.com` nameservers to Cloudflare **OR** add the Pages custom domain via DNS-only.
2. Document existing **MX / SPF / DKIM / DMARC** before the switch and recreate them 1:1 to keep email working.
3. Add `www.sajconnect.com` and `sajconnect.com` as custom domains in the Pages project.
4. SSL is provisioned automatically.

### Required external services

| Service | Purpose | Cost |
|---|---|---|
| Cloudflare Pages | Hosting + CDN + SSL + DDoS + WAF | 0 € |
| eRecht24 Premium | Imprint + privacy auto-updated | ~10 €/mo |
| Cloudflare Web Analytics | Cookieless analytics (optional) | 0 € |
| Web3Forms / Pages Functions | Contact form backend | 0 € |

## Content workflow

Two ways to edit content:

### A) Visual editor (recommended for non-developers)

The site ships with **Decap CMS** at `/admin/` — a Git-based GUI for editing
Stellenanzeigen, Blog-Artikel and i18n strings. Changes commit directly to
GitHub and Cloudflare Pages rebuilds automatically.

→ Full setup + editor guide: [docs/CMS-GUIDE.md](docs/CMS-GUIDE.md)

Local dev: `npm run dev:cms` → http://localhost:4321/admin/ (auth bypassed).
Production: requires GitHub OAuth app + Cloudflare Worker proxy (one-time
setup, ~15 min).

### B) Direct file editing (for developers)

- **Jobs:** add a file under `src/content/jobs/<slug>.<locale>.md` with
  frontmatter matching `src/content/config.ts`.
- **Blog posts:** add under `src/content/blog/<slug>.<locale>.md`.
- **Translations:** edit `src/i18n/<locale>.json`.

## Compliance checklist

- [ ] AVV with Cloudflare signed (Standard contractual clauses)
- [ ] AVV with eRecht24 signed
- [ ] Imprint + privacy texts integrated from eRecht24
- [ ] MX / SPF / DKIM / DMARC migrated without loss
- [ ] No Google Fonts requests (Network tab verification)
- [ ] Cookie banner blocks non-essential scripts before consent
- [ ] Lighthouse mobile: 100 / 100 / 100 / 100

## License

Proprietary — © SAJ Connect. All rights reserved.
