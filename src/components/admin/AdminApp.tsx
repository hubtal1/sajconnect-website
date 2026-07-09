import { useEffect, useState } from "react";

/**
 * Verwaltung: Blog-Artikel und Stellenanzeigen direkt im Browser pflegen.
 * Schreibt über die GitHub-Contents-API in das Repo — jeder Klick ist ein
 * Commit auf main, Cloudflare deployt automatisch. Der Zugriffsschlüssel
 * (Fine-grained PAT, nur dieses Repo, Contents Read/Write) bleibt
 * ausschließlich im localStorage dieses Browsers.
 */

const REPO = "hubtal1/sajconnect-website";
const BRANCH = "main";
const API = "https://api.github.com";
const TOKEN_KEY = "saj_admin_token";

const LANGS = ["de", "en", "pt-br"] as const;
type Lang = (typeof LANGS)[number];
const LANG_LABEL: Record<Lang, string> = { de: "Deutsch", en: "Englisch", "pt-br": "Portugiesisch (BR)" };

type Kind = "jobs" | "blog";

interface FileData {
  path: string;
  sha: string;
  fm: Record<string, string | string[]>;
  body: string;
  locked: boolean;
}

interface Entry {
  slug: string;
  files: Partial<Record<Lang, FileData>>;
  locked: boolean;
}

/* ---------- UTF-8-sichere Base64-Kodierung (btoa allein bricht bei Umlauten) ---------- */

function b64encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function b64decode(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ---------- Frontmatter lesen/schreiben ---------- */
/* q() nutzt JSON.stringify: JSON-Strings sind gültige YAML-Double-Quoted-Skalare
   und escapen Backslashes, Anführungszeichen und Steuerzeichen korrekt —
   ein Titel wie 'C:\Temp' kann so keinen Site-Build mehr brechen. */

const q = (s: unknown) => JSON.stringify(String(s ?? ""));

function parseScalar(val: string): string {
  if (/^".*"$/.test(val)) {
    try {
      return JSON.parse(val) as string;
    } catch {
      return val.slice(1, -1);
    }
  }
  return val;
}

function parseMd(raw: string): { fm: Record<string, string | string[]>; body: string; locked: boolean } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw, locked: true };
  const fm: Record<string, string | string[]> = {};
  let locked = false;
  for (const line of m[1].split(/\r?\n/)) {
    if (/^[A-Za-z][\w-]*:\s*[|>][+-]?\s*$/.test(line)) {
      // Mehrzeilige YAML-Skalare kann diese Oberfläche nicht verlustfrei bearbeiten.
      locked = true;
      continue;
    }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawVal] = kv;
    const val = rawVal.trim();
    if (val.startsWith("[")) {
      fm[key] = [...val.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => {
        try {
          return JSON.parse(`"${x[1]}"`) as string;
        } catch {
          return x[1];
        }
      });
    } else {
      fm[key] = parseScalar(val);
    }
  }
  return { fm, body: m[2], locked };
}

/* Nicht von der Oberfläche verwaltete Felder (z. B. closesAt, cover) bleiben erhalten. */
const JOB_MANAGED = new Set(["title", "locale", "location", "employmentType", "department", "summary", "publishedAt", "draft"]);
const BLOG_MANAGED = new Set(["title", "locale", "description", "author", "publishedAt", "tags", "draft"]);

function serializeExtra(key: string, val: string | string[]): string {
  if (Array.isArray(val)) return `${key}: [${val.map(q).join(", ")}]`;
  if (/^(true|false)$/.test(val) || /^\d{4}-\d{2}-\d{2}/.test(val) || /^-?\d+(\.\d+)?$/.test(val)) return `${key}: ${val}`;
  return `${key}: ${q(val)}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function serializeMd(kind: Kind, fm: Record<string, string | string[]>, body: string): string {
  const managed = kind === "jobs" ? JOB_MANAGED : BLOG_MANAGED;
  const publishedAt = DATE_RE.test(String(fm.publishedAt)) ? fm.publishedAt : today();
  const lines: string[] = [`title: ${q(fm.title)}`, `locale: ${q(fm.locale)}`];
  if (kind === "jobs") {
    lines.push(`location: ${q(fm.location)}`);
    lines.push(`employmentType: ${q(fm.employmentType)}`);
    if (fm.department) lines.push(`department: ${q(fm.department)}`);
    lines.push(`summary: ${q(fm.summary)}`);
  } else {
    lines.push(`description: ${q(fm.description)}`);
    lines.push(`author: ${q(fm.author || "SAJ Connect Team")}`);
  }
  lines.push(`publishedAt: ${publishedAt}`);
  if (kind === "blog") {
    const tags = Array.isArray(fm.tags) ? fm.tags : [];
    lines.push(`tags: [${tags.map(q).join(", ")}]`);
  }
  lines.push(`draft: ${fm.draft === "true" ? "true" : "false"}`);
  for (const key of Object.keys(fm)) {
    if (!managed.has(key)) lines.push(serializeExtra(key, fm[key]));
  }
  return `---\n${lines.join("\n")}\n---\n\n${(body || "").trim()}\n`;
}

/* ---------- GitHub-API (Token wird explizit übergeben) ---------- */

class GhError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function ghHeaders(token: string): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function ghListDir(token: string, dir: string): Promise<{ name: string; path: string }[]> {
  const r = await fetch(`${API}/repos/${REPO}/contents/${dir}?ref=${BRANCH}`, { headers: ghHeaders(token) });
  if (r.status === 404) return [];
  if (!r.ok) throw new GhError(r.status, `Lesen von ${dir}`);
  return r.json();
}

async function ghGetFile(token: string, path: string): Promise<{ raw: string; sha: string }> {
  const r = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}&t=${Date.now()}`, { headers: ghHeaders(token) });
  if (!r.ok) throw new GhError(r.status, `Lesen von ${path}`);
  const d = await r.json();
  return { raw: b64decode(d.content), sha: d.sha };
}

async function ghPutFile(token: string, path: string, content: string, message: string, sha?: string): Promise<void> {
  const r = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}`, {
    method: "PUT",
    headers: { ...ghHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, branch: BRANCH, content: b64encode(content), ...(sha ? { sha } : {}) }),
  });
  if (!r.ok) throw new GhError(r.status, `Speichern von ${path}`);
}

async function ghDeleteFile(token: string, path: string, sha: string, message: string): Promise<void> {
  const r = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(path)}`, {
    method: "DELETE",
    headers: { ...ghHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, branch: BRANCH, sha }),
  });
  if (!r.ok) throw new GhError(r.status, `Löschen von ${path}`);
}

function germanError(e: unknown): string {
  if (e instanceof GhError) {
    if (e.status === 401) return "Der Zugriffsschlüssel ist ungültig oder abgelaufen. Bitte in GitHub einen neuen erstellen und oben eintragen.";
    if (e.status === 403) return "GitHub hat die Anfrage abgelehnt (Berechtigung fehlt oder zu viele Anfragen ohne Schlüssel — bitte Schlüssel eintragen oder kurz warten).";
    if (e.status === 409 || e.status === 422) return "Die Daten waren nicht mehr aktuell — die Ansicht wurde neu geladen. Bitte noch einmal versuchen. (" + e.message + ")";
    return `GitHub-Fehler ${e.status} bei: ${e.message}`;
  }
  return e instanceof Error ? e.message : String(e);
}

/* ---------- Sammlungs-Ladung ---------- */

function fileLang(name: string): Lang | null {
  const m = name.match(/\.(de|en|pt-br)\.mdx?$/);
  return m ? (m[1] as Lang) : null;
}

function fileSlug(name: string): string {
  return name.replace(/\.(de|en|pt-br)\.mdx?$/, "");
}

/* ---------- Formular-Modelle ---------- */

interface LangDraft {
  enabled: boolean;
  title: string;
  summary: string;
  body: string;
}

interface FormState {
  kind: Kind;
  slug: string;
  isNew: boolean;
  publishedAt: string;
  draft: boolean;
  location: string;
  employmentType: string;
  department: string;
  author: string;
  tags: string;
  langs: Record<Lang, LangDraft>;
}

const emptyLang = (): LangDraft => ({ enabled: false, title: "", summary: "", body: "" });

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function newForm(kind: Kind): FormState {
  return {
    kind,
    slug: "",
    isNew: true,
    publishedAt: today(),
    draft: false,
    location: "Remote / Hybrid",
    employmentType: "full-time",
    department: "Engineering",
    author: "SAJ Connect Team",
    tags: "news",
    langs: {
      de: { ...emptyLang(), enabled: true },
      en: { ...emptyLang(), enabled: true },
      "pt-br": emptyLang(),
    },
  };
}

function formFromEntry(kind: Kind, entry: Entry): FormState {
  const f = newForm(kind);
  f.slug = entry.slug;
  f.isNew = false;
  const first = LANGS.map((l) => entry.files[l]).find(Boolean);
  if (first) {
    f.publishedAt = String(first.fm.publishedAt || today());
    f.draft = first.fm.draft === "true";
    f.location = String(first.fm.location || f.location);
    f.employmentType = String(first.fm.employmentType || f.employmentType);
    f.department = String(first.fm.department || "");
    f.author = String(first.fm.author || f.author);
    f.tags = Array.isArray(first.fm.tags) ? first.fm.tags.join(", ") : f.tags;
  }
  for (const l of LANGS) {
    const file = entry.files[l];
    f.langs[l] = file
      ? {
          enabled: true,
          title: String(file.fm.title || ""),
          summary: String(file.fm.summary || file.fm.description || ""),
          body: file.body.trim(),
        }
      : emptyLang();
  }
  return f;
}

/* ---------- Haupt-App ---------- */

export default function AdminApp() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tab, setTab] = useState<Kind>("jobs");
  const [entries, setEntries] = useState<Record<Kind, Entry[]>>({ jobs: [], blog: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<FormState | null>(null);

  async function reload(t: string, silent = false) {
    setLoading(true);
    if (!silent) setError("");
    try {
      const next: Record<Kind, Entry[]> = { jobs: [], blog: [] };
      for (const kind of ["jobs", "blog"] as Kind[]) {
        const files = (await ghListDir(t, `src/content/${kind}`)).filter((f) => fileLang(f.name));
        const loaded = await Promise.all(
          files.map(async (f) => {
            const { raw, sha } = await ghGetFile(t, f.path);
            const { fm, body, locked } = parseMd(raw);
            return { name: f.name, path: f.path, sha, fm, body, locked };
          })
        );
        const bySlug = new Map<string, Entry>();
        for (const f of loaded) {
          const slug = fileSlug(f.name);
          const lang = fileLang(f.name)!;
          if (!bySlug.has(slug)) bySlug.set(slug, { slug, files: {}, locked: false });
          const entry = bySlug.get(slug)!;
          entry.files[lang] = { path: f.path, sha: f.sha, fm: f.fm, body: f.body, locked: f.locked };
          entry.locked = entry.locked || f.locked;
        }
        next[kind] = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
      }
      setEntries(next);
    } catch (e) {
      if (!silent) setError(germanError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let t = "";
    try {
      t = localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      /* storage unavailable */
    }
    setToken(t);
    void reload(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveToken() {
    const t = tokenInput.trim();
    if (!t) {
      setError("Bitte den Schlüssel in das Feld einfügen.");
      return;
    }
    setError("");
    setNotice("");
    setBusy("Prüfe Schlüssel…");
    try {
      const r = await fetch(`${API}/repos/${REPO}`, { headers: ghHeaders(t) });
      if (!r.ok) {
        setError("GitHub hat den Schlüssel abgelehnt (ungültig, abgelaufen oder falsches Repository).");
        return;
      }
      const d = await r.json();
      if (d.permissions && d.permissions.push === false) {
        setError("Der Schlüssel hat kein Schreibrecht. Bitte mit Berechtigung 'Contents: Read and write' neu erstellen.");
        return;
      }
      try {
        localStorage.setItem(TOKEN_KEY, t);
      } catch {
        /* ignore */
      }
      setToken(t);
      setTokenInput("");
      setNotice("Zugriffsschlüssel geprüft und gespeichert.");
      void reload(t, true);
    } finally {
      setBusy("");
    }
  }

  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setToken("");
    setTokenInput("");
    setNotice("Zugriffsschlüssel entfernt.");
  }

  /** Führt eine Schreiboperation aus; gibt true bei Erfolg zurück. Lädt IMMER neu (frische SHAs). */
  async function run(label: string, fn: () => Promise<void>): Promise<boolean> {
    setBusy(label);
    setError("");
    setNotice("");
    let ok = false;
    try {
      await fn();
      ok = true;
      setNotice("Gespeichert. Die Website aktualisiert sich in ca. 2 Minuten automatisch.");
    } catch (e) {
      setError(germanError(e));
    } finally {
      setBusy("");
      await reload(token, true);
    }
    return ok;
  }

  function entryStatus(e: Entry): { live: boolean; label: string } {
    const anyLive = LANGS.some((l) => e.files[l] && e.files[l]!.fm.draft !== "true");
    return anyLive ? { live: true, label: "online" } : { live: false, label: "offline (Entwurf)" };
  }

  async function toggleDraft(kind: Kind, e: Entry) {
    const makeDraft = entryStatus(e).live;
    await run(makeDraft ? "Nehme offline…" : "Stelle online…", async () => {
      for (const l of LANGS) {
        const f = e.files[l];
        if (!f) continue;
        const fm = { ...f.fm, draft: makeDraft ? "true" : "false" };
        const content = serializeMd(kind, fm, f.body);
        await ghPutFile(token, f.path, content, `content(${kind}): ${makeDraft ? "unpublish" : "publish"} "${e.slug}" (${l})`, f.sha);
      }
    });
  }

  async function removeEntry(kind: Kind, e: Entry) {
    const what = kind === "jobs" ? "Stelle" : "Artikel";
    if (!window.confirm(`${what} "${e.slug}" in allen Sprachen endgültig löschen?`)) return;
    await run("Lösche…", async () => {
      for (const l of LANGS) {
        const f = e.files[l];
        if (!f) continue;
        await ghDeleteFile(token, f.path, f.sha, `content(${kind}): delete "${e.slug}" (${l})`);
      }
    });
  }

  async function saveForm(f: FormState) {
    setError("");
    const slug = f.isNew ? slugify(f.slug || f.langs.de.title || f.langs.en.title) : f.slug;
    if (!slug) {
      setError("Bitte einen Titel oder Slug angeben.");
      return;
    }
    if (!DATE_RE.test(f.publishedAt)) {
      setError("Bitte ein Veröffentlichungsdatum angeben.");
      return;
    }
    const active = LANGS.filter((l) => f.langs[l].enabled);
    if (active.length === 0) {
      setError("Mindestens eine Sprache aktivieren.");
      return;
    }
    for (const l of active) {
      if (!f.langs[l].title.trim()) {
        setError(`Titel fehlt (${LANG_LABEL[l]}).`);
        return;
      }
    }
    const existing = entries[f.kind].find((e) => e.slug === slug);
    if (f.isNew && existing) {
      setError(`Es existiert bereits ein Eintrag mit dem Namen „${slug}" — bitte den bestehenden Eintrag bearbeiten oder einen anderen Slug wählen.`);
      return;
    }
    // Abgewählte, existierende Sprachfassungen: vorher bestätigen lassen.
    const toDelete = !f.isNew && existing ? LANGS.filter((l) => !f.langs[l].enabled && existing.files[l]) : [];
    if (toDelete.length > 0) {
      const names = toDelete.map((l) => LANG_LABEL[l]).join(", ");
      if (!window.confirm(`Die Sprachfassung(en) ${names} werden dadurch endgültig gelöscht. Fortfahren?`)) return;
    }

    const ok = await run("Speichere…", async () => {
      for (const l of active) {
        const d = f.langs[l];
        const fmBase: Record<string, string | string[]> = {
          ...(existing?.files[l]?.fm ?? {}), // nicht verwaltete Felder (closesAt, cover, …) erhalten
          title: d.title.trim(),
          locale: l,
          publishedAt: f.publishedAt,
          draft: f.draft ? "true" : "false",
        };
        if (f.kind === "jobs") {
          fmBase.location = f.location.trim();
          fmBase.employmentType = f.employmentType;
          fmBase.department = f.department.trim();
          fmBase.summary = d.summary.trim();
        } else {
          fmBase.description = d.summary.trim();
          fmBase.author = f.author.trim();
          fmBase.tags = f.tags.split(",").map((t) => t.trim()).filter(Boolean);
        }
        const content = serializeMd(f.kind, fmBase, d.body);
        // Selbstkontrolle: Datei muss wieder sauber lesbar sein, sonst nicht committen.
        const check = parseMd(content);
        if (check.locked || String(check.fm.title) !== d.title.trim() || check.fm.locale !== l || !DATE_RE.test(String(check.fm.publishedAt))) {
          throw new Error(`Interne Prüfung fehlgeschlagen für ${LANG_LABEL[l]} — Eingaben enthalten nicht darstellbare Zeichen.`);
        }
        const path = existing?.files[l]?.path ?? `src/content/${f.kind}/${slug}.${l}.md`;
        const sha = existing?.files[l]?.sha;
        await ghPutFile(token, path, content, `content(${f.kind}): ${sha ? "update" : "create"} "${slug}" (${l})`, sha);
      }
      for (const l of toDelete) {
        const file = existing!.files[l]!;
        await ghDeleteFile(token, file.path, file.sha, `content(${f.kind}): delete "${slug}" (${l})`);
      }
    });
    if (ok) setForm(null);
  }

  const list = entries[tab];

  return (
    <div className="mx-auto max-w-[900px] px-6 pb-24 pt-10">
      <header className="border-b border-[var(--color-hairline-dark)] pb-6">
        <h1 className="text-2xl font-bold">SAJ Connect — Verwaltung</h1>
        <p className="mt-2 text-sm text-[var(--color-text-on-carbon-muted)]">
          Blog-Artikel und Stellenanzeigen pflegen. Jede Änderung wird gespeichert und die Website in ca. 2 Minuten automatisch aktualisiert.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-[0.75rem] font-bold text-[var(--color-text-on-carbon-faint)]">
              {token ? "Neuen Zugriffsschlüssel eintragen (optional)" : "GitHub-Zugriffsschlüssel"}
            </span>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="github_pat_…"
              className="mt-1 w-72 border border-[var(--color-hairline-dark)] bg-[var(--color-carbon)] px-3 py-2 font-mono text-sm"
            />
          </label>
          <button onClick={() => void saveToken()} disabled={!!busy} className="border border-[var(--color-cobalt)] px-4 py-2 text-sm font-bold text-[var(--color-cobalt)] hover:bg-[var(--color-cobalt)] hover:text-white disabled:opacity-40">
            Speichern
          </button>
          {token && (
            <button onClick={clearToken} className="border border-[var(--color-hairline-dark)] px-4 py-2 text-sm font-bold text-[var(--color-text-on-carbon-muted)] hover:border-red-300 hover:text-red-700">
              Schlüssel entfernen
            </button>
          )}
          <span className={`text-sm ${token ? "text-[var(--color-saj-green-bright)]" : "text-[var(--color-text-on-carbon-faint)]"}`}>
            {token ? "● Schreibzugriff aktiv" : "○ Nur Lesen — Schlüssel eintragen zum Bearbeiten"}
          </span>
        </div>
        {!token && (
          <p className="mt-3 max-w-[70ch] text-xs leading-relaxed text-[var(--color-text-on-carbon-faint)]">
            Schlüssel erstellen: GitHub → Settings → Developer settings → Fine-grained personal access tokens → „Generate new token".
            Repository access: nur <span className="font-mono">sajconnect-website</span> · Permissions: Contents → Read and write.
          </p>
        )}
      </header>

      {(error || notice || busy) && (
        <div
          role="status"
          className={`mt-4 border px-4 py-3 text-sm ${
            error
              ? "border-red-300 bg-red-50 text-red-800"
              : "border-[var(--color-hairline-dark)] bg-[var(--color-carbon-soft)] text-[var(--color-text-on-carbon)]"
          }`}
        >
          {error || busy || notice}
        </div>
      )}

      <nav className="mt-8 flex gap-6 border-b border-[var(--color-hairline-dark)]">
        {(["jobs", "blog"] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => {
              setTab(k);
              setForm(null);
            }}
            className={`-mb-px border-b-2 pb-3 text-sm font-bold ${
              tab === k ? "border-[var(--color-cobalt)] text-[var(--color-text-on-carbon)]" : "border-transparent text-[var(--color-text-on-carbon-faint)]"
            }`}
          >
            {k === "jobs" ? "Stellenanzeigen" : "Blog"}
          </button>
        ))}
      </nav>

      {form ? (
        <EditorForm form={form} setForm={setForm} onSave={(f) => void saveForm(f)} busy={!!busy} />
      ) : (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{tab === "jobs" ? "Stellenanzeigen" : "Blog-Artikel"}</h2>
            <button
              onClick={() => setForm(newForm(tab))}
              disabled={!token || !!busy}
              className="bg-[var(--color-cobalt)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-cobalt-light)] disabled:opacity-40"
            >
              {tab === "jobs" ? "Neue Stelle" : "Neuer Artikel"}
            </button>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-[var(--color-text-on-carbon-faint)]">Lade…</p>
          ) : list.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--color-text-on-carbon-faint)]">Noch keine Einträge.</p>
          ) : (
            <ul className="mt-4">
              {list.map((e) => {
                const st = entryStatus(e);
                const title = LANGS.map((l) => e.files[l]?.fm.title).find(Boolean) as string;
                return (
                  <li key={e.slug} className="flex flex-wrap items-center gap-3 border-t border-[var(--color-hairline-dark)] py-4">
                    <span className={`h-2.5 w-2.5 rounded-full ${st.live ? "bg-[var(--color-saj-green-bright)]" : "bg-[var(--color-graphite)]"}`} title={st.label}></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{title || e.slug}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-on-carbon-faint)]">
                        {e.slug} · {LANGS.filter((l) => e.files[l]).map((l) => l.toUpperCase()).join(" · ")} · {st.label}
                        {e.locked && " · enthält Spezial-Formatierung — bitte direkt im Repo bearbeiten"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setForm(formFromEntry(tab, e))} disabled={!token || !!busy || e.locked} className="border border-[var(--color-hairline-dark)] px-3 py-1.5 text-xs font-bold hover:border-[var(--color-cobalt)] disabled:opacity-40">
                        Bearbeiten
                      </button>
                      <button onClick={() => void toggleDraft(tab, e)} disabled={!token || !!busy || e.locked} className="border border-[var(--color-hairline-dark)] px-3 py-1.5 text-xs font-bold hover:border-[var(--color-cobalt)] disabled:opacity-40">
                        {st.live ? "Offline nehmen" : "Online stellen"}
                      </button>
                      <button onClick={() => void removeEntry(tab, e)} disabled={!token || !!busy} className="border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40">
                        Löschen
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-8 text-xs text-[var(--color-text-on-carbon-faint)]">
            Hinweis: „Offline nehmen" setzt den Eintrag auf Entwurf (bleibt erhalten und kann wieder online gestellt werden). „Löschen" entfernt ihn endgültig — in allen Sprachen.
          </p>
        </section>
      )}
    </div>
  );
}

/* ---------- Editor-Formular ---------- */

function EditorForm({
  form,
  setForm,
  onSave,
  busy,
}: {
  form: FormState;
  setForm: (f: FormState | null) => void;
  onSave: (f: FormState) => void;
  busy: boolean;
}) {
  const isJob = form.kind === "jobs";
  const upd = (patch: Partial<FormState>) => setForm({ ...form, ...patch });
  const updLang = (l: Lang, patch: Partial<LangDraft>) => setForm({ ...form, langs: { ...form.langs, [l]: { ...form.langs[l], ...patch } } });

  const inputCls = "mt-1 w-full border border-[var(--color-hairline-dark)] bg-[var(--color-carbon)] px-3 py-2 text-sm";
  const labelCls = "block text-[0.75rem] font-bold text-[var(--color-text-on-carbon-faint)]";

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">
        {form.isNew ? (isJob ? "Neue Stelle" : "Neuer Artikel") : `Bearbeiten: ${form.slug}`}
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {form.isNew && (
          <label className="block">
            <span className={labelCls}>Slug (URL-Name; leer = automatisch aus Titel)</span>
            <input className={`${inputCls} font-mono`} value={form.slug} onChange={(e) => upd({ slug: e.target.value })} placeholder="z. B. rf-engineer" />
          </label>
        )}
        <label className="block">
          <span className={labelCls}>Veröffentlicht am</span>
          <input type="date" className={inputCls} value={form.publishedAt} onChange={(e) => upd({ publishedAt: e.target.value })} />
        </label>
        {isJob ? (
          <>
            <label className="block">
              <span className={labelCls}>Standort</span>
              <input className={inputCls} value={form.location} onChange={(e) => upd({ location: e.target.value })} />
            </label>
            <label className="block">
              <span className={labelCls}>Anstellungsart</span>
              <select className={inputCls} value={form.employmentType} onChange={(e) => upd({ employmentType: e.target.value })}>
                <option value="full-time">Vollzeit</option>
                <option value="part-time">Teilzeit</option>
                <option value="contract">Freelance / Vertrag</option>
                <option value="internship">Praktikum / Werkstudent</option>
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Abteilung</span>
              <input className={inputCls} value={form.department} onChange={(e) => upd({ department: e.target.value })} />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              <span className={labelCls}>Autor</span>
              <input className={inputCls} value={form.author} onChange={(e) => upd({ author: e.target.value })} />
            </label>
            <label className="block">
              <span className={labelCls}>Tags (kommagetrennt)</span>
              <input className={inputCls} value={form.tags} onChange={(e) => upd({ tags: e.target.value })} />
            </label>
          </>
        )}
        <label className="flex items-center gap-2 self-end pb-1">
          <input type="checkbox" checked={form.draft} onChange={(e) => upd({ draft: e.target.checked })} />
          <span className="text-sm">Als Entwurf speichern (noch nicht veröffentlichen)</span>
        </label>
      </div>

      {LANGS.map((l) => (
        <fieldset key={l} className="mt-6 border border-[var(--color-hairline-dark)] p-4">
          <legend className="flex items-center gap-2 px-1 text-sm font-bold">
            <input type="checkbox" checked={form.langs[l].enabled} onChange={(e) => updLang(l, { enabled: e.target.checked })} />
            {LANG_LABEL[l]}
            {!form.isNew && !form.langs[l].enabled && (
              <span className="font-normal text-[var(--color-text-on-carbon-faint)]"> (Haken entfernt = Sprachfassung wird gelöscht)</span>
            )}
          </legend>
          {form.langs[l].enabled && (
            <div className="grid gap-3">
              <label className="block">
                <span className={labelCls}>Titel</span>
                <input className={inputCls} value={form.langs[l].title} onChange={(e) => updLang(l, { title: e.target.value })} />
              </label>
              <label className="block">
                <span className={labelCls}>{isJob ? "Kurzbeschreibung (erscheint in der Liste)" : "Beschreibung (erscheint in der Übersicht)"}</span>
                <input className={inputCls} value={form.langs[l].summary} onChange={(e) => updLang(l, { summary: e.target.value })} />
              </label>
              <label className="block">
                <span className={labelCls}>Text (Markdown: ## Überschrift, - Liste, **fett**)</span>
                <textarea
                  className={`${inputCls} min-h-[200px] font-mono text-[0.8125rem] leading-relaxed`}
                  value={form.langs[l].body}
                  onChange={(e) => updLang(l, { body: e.target.value })}
                  placeholder={isJob ? "## Was dich erwartet\n- …\n\n## Was du mitbringst\n- …" : "Artikeltext…"}
                />
              </label>
            </div>
          )}
        </fieldset>
      ))}

      <div className="mt-6 flex gap-3">
        <button onClick={() => onSave(form)} disabled={busy} className="bg-[var(--color-cobalt)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-cobalt-light)] disabled:opacity-40">
          {busy ? "Speichere…" : "Speichern"}
        </button>
        <button onClick={() => setForm(null)} disabled={busy} className="border border-[var(--color-hairline-dark)] px-6 py-2.5 text-sm font-bold disabled:opacity-40">
          Abbrechen
        </button>
      </div>
    </section>
  );
}
