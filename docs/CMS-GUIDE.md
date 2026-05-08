# SAJ Connect — Content Editor Guide

Du editierst Inhalte (Stellenanzeigen, Blog-Artikel, Seiten-Texte) über
**Decap CMS** unter `/admin/`. Alle Änderungen committest du mit einem Klick
direkt in das GitHub-Repo, Cloudflare Pages baut die Webseite automatisch neu.

## Inhaltsverzeichnis

1. [Erste Einrichtung (einmalig, ~15 Min)](#erste-einrichtung)
2. [Lokal arbeiten](#lokal-arbeiten)
3. [Live-Bearbeitung](#live-bearbeitung)
4. [Eine Stellenanzeige anlegen](#eine-stellenanzeige-anlegen)
5. [Einen Blog-Artikel anlegen](#einen-blog-artikel-anlegen)
6. [Seiten-Texte ändern](#seiten-texte-ändern)
7. [Mehrsprachigkeit](#mehrsprachigkeit)

---

## Erste Einrichtung

### A) GitHub-Repo

Wenn das Repo `sajconnect-website` noch nicht auf GitHub liegt: anlegen und in
`public/admin/config.yml` den Eintrag `backend.repo` auf `<dein-user>/<repo>`
anpassen.

### B) GitHub-OAuth-App

1. https://github.com/settings/developers → **New OAuth App**
2. Felder:
   - **Application name:** `SAJ Connect CMS`
   - **Homepage URL:** `https://www.sajconnect.com`
   - **Authorization callback URL:** `https://decap-proxy.sajconnect.workers.dev/callback`
     *(URL kommt aus dem nächsten Schritt — kannst du nach Deploy nachtragen)*
3. **Generate a new client secret** — Client ID und Secret merken.

### C) Cloudflare-Worker als OAuth-Proxy

```
cd admin-oauth-worker
npm install
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID       # Client ID einfügen
npx wrangler secret put GITHUB_CLIENT_SECRET   # Client Secret einfügen
npx wrangler deploy
```

Die ausgegebene URL (z. B. `https://decap-proxy.deinaccount.workers.dev`)
kommt nun in:
- `public/admin/config.yml` → `backend.base_url`
- GitHub-OAuth-App → `Authorization callback URL` als `<URL>/callback`

### D) Cloudflare Pages

Repo mit Cloudflare Pages verbinden, Build-Command `npm run build`,
Output `dist`. Domain `www.sajconnect.com` als Custom Domain hinzufügen.

---

## Lokal arbeiten

Wenn du Inhalte testen willst bevor sie live gehen:

```
npm install
npm run dev:cms
```

Das startet zwei Prozesse parallel:
- **Astro** auf http://localhost:4321 (deine lokale Webseite)
- **Decap Server** auf http://localhost:8081 (Auth-Bypass für lokale Bearbeitung)

→ http://localhost:4321/admin/ öffnen, ohne Login direkt editieren. Änderungen
landen direkt in den lokalen MDX-Dateien (`src/content/jobs/*.md` etc.).

---

## Live-Bearbeitung

1. https://www.sajconnect.com/admin/ öffnen
2. **Login with GitHub** klicken → autorisieren
3. Editor öffnet sich
4. Eintrag anlegen / ändern / löschen
5. **Publish** → Commit landet auf `main` → Cloudflare Pages baut neu (~1 Min)

> **Tipp:** Vor dem Publish kannst du **Save Draft** klicken. Drafts werden im
> CMS angezeigt aber sind auf der Live-Site nicht sichtbar (`draft: true`-Flag).

---

## Eine Stellenanzeige anlegen

1. Im CMS: **Stellenanzeigen** → **New Stelle**
2. Felder ausfüllen:
   - **Titel:** z. B. „Senior 5G Network Engineer (m/w/d)"
   - **Sprache:** Deutsch / English / Português (BR)
   - **Standort:** „Remote / Hybrid" oder „Offenhausen, DE"
   - **Anstellungsart:** Vollzeit / Teilzeit / Werkvertrag / Praktikum
   - **Abteilung:** z. B. „Engineering" (optional)
   - **Kurzbeschreibung:** 1–2 Sätze (erscheint in der Liste)
   - **Veröffentlicht am:** Datum
   - **Bewerbungsfrist:** optional
   - **Entwurf:** Häkchen lassen wenn noch nicht freigeben
   - **Stellenbeschreibung:** Volltext im Markdown-Editor
3. **Publish** → Stelle ist live

> **Mehrsprachig:** Pro Sprache eine eigene Stelle anlegen. Verwende denselben
> Slug (URL-Teil) — das System hängt automatisch `.de.md` / `.en.md` /
> `.pt-br.md` an.

---

## Einen Blog-Artikel anlegen

1. **Blog & Insights** → **New Artikel**
2. Felder:
   - **Titel**
   - **Sprache**
   - **Kurzbeschreibung / Lead** — erscheint in der Listenansicht und für SEO
   - **Autor:in** — Default „SAJ Connect Team"
   - **Veröffentlicht am**
   - **Tags:** Liste, Stichworte kleinbuchstabig (z. B. `5g`, `engineering`)
   - **Titelbild:** optional, Upload via Drag & Drop
   - **Entwurf**
   - **Inhalt** — Markdown-Editor mit Live-Preview
3. **Publish**

---

## Seiten-Texte ändern

Headlines, Buttons, Footer-Texte etc. sind als JSON gespeichert.

1. **Seiten-Texte** → Sprache wählen (Deutsch / English / Português)
2. Felder ändern:
   - `site.tagline`
   - `home.hero.headline`, `home.hero.sub`, …
   - `home.cta.headline`, …
3. **Publish**

> **Wichtig:** Die **Schlüssel** (links, z. B. `home.hero.headline`) sind im
> Code referenziert — bitte nur die **Werte** rechts ändern.

---

## Mehrsprachigkeit

Die Webseite läuft in **Deutsch / Englisch / Portugiesisch (BR)**. Jeder Inhalt
muss in jeder gewünschten Sprache separat angelegt werden — es gibt keine
automatische Übersetzung.

**Empfehlung:**
- Nur Deutsch + Englisch pflegen, PT-BR später ergänzen
- Job-Slug pro Sprache identisch halten (`fullstack-engineer.de.md` /
  `fullstack-engineer.en.md`) damit URL-Wechsel beim Sprachwechsel klappt

---

## Häufige Fragen

**Frage:** Wie sehe ich Änderungen vor dem Publish?
> Das Markdown-Preview-Panel im CMS zeigt eine Vorschau. Für den vollen Live-
> Look: Lokal `npm run dev:cms` und im CMS-Editor "Local backend" verwenden.

**Frage:** Ich habe einen Tippfehler — wie korrigiere ich nach dem Publish?
> Eintrag öffnen → ändern → **Publish** → Commit. Cloudflare Pages baut neu.

**Frage:** Kann ich Bilder einfügen?
> Ja — im Markdown-Editor das Bild-Icon nutzen oder in den **Media**-Bereich
> hochladen. Bilder werden in `public/uploads/` gespeichert.

**Frage:** Wer kann sich am CMS anmelden?
> Jede Person mit GitHub-Account, die als Collaborator im Repo eingetragen
> ist. GitHub-Settings → Repo → Collaborators → invitieren.
