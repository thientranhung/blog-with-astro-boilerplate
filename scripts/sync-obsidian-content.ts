/**
 * Obsidian → Astro content sync pipeline.
 *
 * Usage:
 *   pnpm run sync                           (reads .env for VAULT_PATH)
 *   VAULT_PATH=./test-vault VAULT_POSTS_FOLDER=50-Publish pnpm run sync
 *
 * Outputs:
 *   src/content/posts/{slug}.md       — normalized markdown
 *   src/content/generated/*.json      — manifests (backlinks, tags, series, …)
 */

import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import matter from "gray-matter";
import slugifyLib from "slugify";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client, r2Configured } from "../src/lib/cloudflare/r2-client";

// ── Types ─────────────────────────────────────────────────────────────────────

type Lang = "vi" | "en";

interface ParsedNote {
  filePath: string;
  sourcePath: string;
  basename: string;
  slug: string;
  lang: Lang;
  title: string;
  description?: string;
  excerpt?: string;
  tags: string[];
  series?: string;
  translationKey?: string;
  canonical?: string;
  cover?: string;   // original vault path, e.g. /Assets/hero.jpg
  created?: string; // YYYY-MM-DD
  updated?: string; // YYYY-MM-DD
  body: string;
}

interface ProcessedNote extends ParsedNote {
  outboundLinks: string[];
  unresolvedLinks: string[];
  assetRefs: string[];  // basenames from ![[image.png]] embeds
}

type SlugMap = Record<string, Record<string, string>>; // lang → { key → slug }

// ── Config ────────────────────────────────────────────────────────────────────

const VAULT_PATH = process.env.VAULT_PATH;
const VAULT_POSTS_FOLDER = process.env.VAULT_POSTS_FOLDER ?? "50-Publish";
const VALID_LANGS: Lang[] = ["vi", "en"];

const PROJECT_ROOT = path.resolve(process.cwd());
const OUTPUT_POSTS_DIR = path.join(PROJECT_ROOT, "src", "content", "posts");
const OUTPUT_GENERATED_DIR = path.join(PROJECT_ROOT, "src", "content", "generated");
const ASSETS_JSON_PATH = path.join(OUTPUT_GENERATED_DIR, "assets.json");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

// ── Slug ──────────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  // Pre-map Vietnamese Đ/đ → d before slugify-lib sees them (library maps đ→dj by default)
  const normalized = str.replace(/[Đđ]/g, "d");
  return slugifyLib(normalized, { lower: true, strict: true, trim: true });
}

function resolveSlug(frontmatterSlug: unknown, basename: string): string {
  if (typeof frontmatterSlug === "string" && frontmatterSlug.trim()) {
    return slugify(frontmatterSlug.trim());
  }
  return slugify(basename);
}

function normalizeImageField(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  const markdownImage = trimmed.match(/^!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
  if (markdownImage) return markdownImage[1].trim();

  return trimmed;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDateStr(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return undefined;
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
  }
  return undefined;
}

// ── Asset helpers ─────────────────────────────────────────────────────────────

function computeContentHash(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12);
}

function safeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, path.extname(name));
  const safe = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${safe}${ext}`;
}

function logicalPath(basename: string): string {
  return `/__assets/${path.basename(basename)}`;
}

function getContentType(ext: string): string {
  return CONTENT_TYPES[ext.toLowerCase()] ?? "application/octet-stream";
}

// ── File scanning ─────────────────────────────────────────────────────────────

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

/** Map: lowercase basename → absolute path for every file in vault. */
function buildVaultFileIndex(vaultRoot: string): Map<string, string> {
  const index = new Map<string, string>();
  function scan(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.isFile()) {
        const key = entry.name.toLowerCase();
        if (!index.has(key)) index.set(key, full);
      }
    }
  }
  scan(vaultRoot);
  return index;
}

// ── Frontmatter parsing ───────────────────────────────────────────────────────

function parseNote(filePath: string, vaultRoot: string): ParsedNote | null {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    throw new Error(`[error] Cannot read file: ${filePath}`);
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (e) {
    throw new Error(`[error] Cannot parse frontmatter in: ${filePath} — ${e}`);
  }

  const d = parsed.data;

  // Accept both `published: true` and `publish_status: publish`
  const isPublished = d.published === true || d.publish_status === "publish";
  if (!isPublished) return null;

  if (!d.title || typeof d.title !== "string" || !d.title.trim()) {
    throw new Error(`[error] Missing 'title' in published note: ${filePath}`);
  }

  let lang: Lang = "vi";
  if (d.lang !== undefined && d.lang !== null) {
    if (!VALID_LANGS.includes(d.lang as Lang)) {
      throw new Error(
        `[error] Invalid lang '${d.lang}' in: ${filePath}. Must be: ${VALID_LANGS.join(", ")}`
      );
    }
    lang = d.lang as Lang;
  }

  const basename = path.basename(filePath, ".md");
  const slug = resolveSlug(d.slug, basename);

  // Normalize alternative field names from different Obsidian templates
  if (!d.description && typeof d.short_description === "string") {
    d.description = d.short_description;
  }
  d.cover = normalizeImageField(d.cover);
  d.featured_image = normalizeImageField(d.featured_image);
  if (!d.cover && typeof d.featured_image === "string") {
    d.cover = d.featured_image;
  }

  // Hard error: cover file must exist on disk (skip remote URLs)
  if (typeof d.cover === "string" && d.cover.trim() && !d.cover.trim().startsWith("http")) {
    const coverAbs = path.join(vaultRoot, d.cover.trim().replace(/^\//, ""));
    if (!fs.existsSync(coverAbs)) {
      throw new Error(
        `[error] Cover asset not found: ${filePath} — cover: ${d.cover}`
      );
    }
  }

  // Warn on extra fields
  const KNOWN_FIELDS = new Set([
    "title", "published", "publish_status", "slug", "description", "short_description",
    "excerpt", "tags", "series", "lang", "translationKey", "canonical", "cover",
    "featured_image", "created", "updated", "draft", "featured", "author",
    // Obsidian workflow fields (ignored by pipeline, not errors)
    "capture_type", "channel", "audience", "publish_category", "publish_date",
    "source_note", "mocs", "aliases", "cssclasses", "banner", "banner_y",
    "placement", "status", "source",
  ]);
  for (const key of Object.keys(d)) {
    if (!KNOWN_FIELDS.has(key)) {
      report.warnings.push(
        `[warn] Extra frontmatter field '${key}' in: ${path.relative(vaultRoot, filePath)}`
      );
    }
  }

  return {
    filePath,
    sourcePath: path.relative(vaultRoot, filePath),
    basename,
    slug,
    lang,
    title: d.title.trim(),
    description: typeof d.description === "string" ? d.description.trim() : undefined,
    excerpt: typeof d.excerpt === "string" ? d.excerpt.trim() : undefined,
    tags: Array.isArray(d.tags) ? d.tags.map(String).filter(Boolean) : [],
    series: typeof d.series === "string" ? d.series.trim() : undefined,
    translationKey: typeof d.translationKey === "string" ? d.translationKey.trim() : undefined,
    canonical: typeof d.canonical === "string" ? d.canonical.trim() : undefined,
    cover: typeof d.cover === "string" ? d.cover.trim() : undefined,
    created: toDateStr(d.created),
    updated: toDateStr(d.updated),
    body: parsed.content,
  };
}

// ── Slug map ─────────────────────────────────────────────────────────────────

function buildSlugMap(notes: ParsedNote[]): SlugMap {
  const map: SlugMap = { vi: {}, en: {} };
  for (const note of notes) {
    const lang = note.lang;
    map[lang][note.basename.toLowerCase()] = note.slug;
    map[lang][note.slug.toLowerCase()] = note.slug;
    map[lang][note.title.toLowerCase()] = note.slug;
  }
  return map;
}

// ── Wikilink & image processing ───────────────────────────────────────────────

const WIKILINK_RE = /\[\[([^\]|#\n]+?)(?:\|([^\]\n]+?))?\]\]/g;
const HEADING_WIKILINK_RE = /\[\[#([^\]|#\n]+?)(?:\|([^\]\n]+?))?\]\]/g;
const IMAGE_EMBED_RE = /!\[\[([^\]\n]+?)\]\]/g;

/** Approximates github-slugger for heading anchor IDs (matches Astro's rehype-slug). */
function headingAnchor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")  // keep Unicode letters/numbers, spaces, hyphens
    .trim()
    .replace(/\s+/g, "-");
}

function wikiLinkUrl(slug: string, targetLang: Lang): string {
  return targetLang === "vi" ? `/posts/${slug}/` : `/en/posts/${slug}/`;
}

function processBody(
  body: string,
  sourceLang: Lang,
  slugMap: SlugMap
): {
  body: string;
  outboundLinks: string[];
  unresolvedLinks: string[];
  assetRefs: string[];
} {
  const outboundLinks: string[] = [];
  const unresolvedLinks: string[] = [];
  const assetRefs: string[] = [];

  const savedBlocks: string[] = [];
  const savedInline: string[] = [];

  let out = body.replace(/```[\s\S]*?```/g, m => {
    savedBlocks.push(m);
    return `\x00BLCK${savedBlocks.length - 1}\x00`;
  });
  out = out.replace(/`[^`\n]+`/g, m => {
    savedInline.push(m);
    return `\x00INLN${savedInline.length - 1}\x00`;
  });

  // Strip Obsidian comments %%...%% (can be multiline)
  out = out.replace(/%%[\s\S]*?%%/g, "");

  // Strip Obsidian block IDs: trailing ^identifier at end of line
  out = out.replace(/\s+\^[a-zA-Z0-9-]+$/gm, "");

  // ==highlight== → <mark>highlight</mark>
  out = out.replace(/==([^=\n]+)==/g, "<mark>$1</mark>");

  out = out.replace(IMAGE_EMBED_RE, (_, raw) => {
    const pipeIdx = raw.indexOf("|");
    const filename = (pipeIdx !== -1 ? raw.slice(0, pipeIdx) : raw).trim();
    const alt =
      pipeIdx !== -1
        ? raw.slice(pipeIdx + 1).trim()
        : path.basename(filename, path.extname(filename));
    const safe = path.basename(filename);
    assetRefs.push(safe);
    return `![${alt}](/__assets/${safe})`;
  });

  // [[#Heading|Alias]] → [Alias](#anchor) — in-page heading links
  out = out.replace(HEADING_WIKILINK_RE, (_, heading, label) => {
    const display = label?.trim() || heading.trim();
    return `[${display}](#${headingAnchor(heading.trim())})`;
  });

  out = out.replace(WIKILINK_RE, (_, target, label) => {
    const rawTarget = target.trim();
    const basename = rawTarget.split("/").pop()!.trim();
    const display = label?.trim() || basename;
    const key = basename.toLowerCase();

    const sameLangSlug = slugMap[sourceLang]?.[key];
    if (sameLangSlug) {
      const url = wikiLinkUrl(sameLangSlug, sourceLang);
      if (!outboundLinks.includes(sameLangSlug)) outboundLinks.push(sameLangSlug);
      return `[${display}](${url})`;
    }

    const otherLang: Lang = sourceLang === "vi" ? "en" : "vi";
    const crossSlug = slugMap[otherLang]?.[key];
    if (crossSlug) {
      const url = wikiLinkUrl(crossSlug, otherLang);
      if (!outboundLinks.includes(crossSlug)) outboundLinks.push(crossSlug);
      return `[${display}](${url})`;
    }

    if (!unresolvedLinks.includes(basename)) unresolvedLinks.push(basename);
    return display;
  });

  out = out.replace(/\x00BLCK(\d+)\x00/g, (_, i) => savedBlocks[+i]);
  out = out.replace(/\x00INLN(\d+)\x00/g, (_, i) => savedInline[+i]);

  // Obsidian callout: "> [!type]" immediately followed by content on next line
  // → insert blank blockquote line so rehype-callouts sees separate paragraphs
  out = out.replace(/(^|\n)(> \[![^\]\n]+\]([^\n]*))\n(> [^\n])/g, (_, pre, typeLine, _title, contentStart) => {
    return `${pre}${typeLine}\n>\n${contentStart}`;
  });

  const MD_IMG_RE = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = MD_IMG_RE.exec(out)) !== null) {
    const src = m[1];
    if (!src.startsWith("http") && !src.startsWith("/__assets/") && !src.startsWith("data:")) {
      assetRefs.push(src);
    }
  }

  return { body: out, outboundLinks, unresolvedLinks, assetRefs };
}

// ── R2 upload ─────────────────────────────────────────────────────────────────

interface AssetEntry {
  logicalPath: string;   // /__assets/filename.ext
  absolutePath: string;  // /vault/Assets/filename.ext
}

async function uploadAssets(
  notes: ProcessedNote[],
  vaultRoot: string,
  vaultFileIndex: Map<string, string>
): Promise<{ assetsMap: Record<string, string>; uploaded: number; reused: number }> {
  // Load old assets.json for dedup
  let oldMap: Record<string, string> = {};
  if (fs.existsSync(ASSETS_JSON_PATH)) {
    try {
      oldMap = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, "utf-8"));
    } catch {
      oldMap = {};
    }
  }

  // Collect unique assets from all notes
  const seen = new Set<string>();
  const entries: AssetEntry[] = [];

  for (const note of notes) {
    // Body image embeds (basenames)
    for (const ref of note.assetRefs) {
      const lp = logicalPath(ref);
      if (seen.has(lp)) continue;
      seen.add(lp);
      const absPath = vaultFileIndex.get(ref.toLowerCase());
      if (absPath) {
        entries.push({ logicalPath: lp, absolutePath: absPath });
      } else {
        report.warnings.push(`[warn] Asset file not found in vault: ${ref}`);
      }
    }

    // Cover (original vault path like /Assets/hero.jpg — remote URLs are skipped)
    if (note.cover && !note.cover.startsWith("http")) {
      const coverBasename = path.basename(note.cover);
      const lp = logicalPath(coverBasename);
      if (!seen.has(lp)) {
        seen.add(lp);
        const absPath = path.join(vaultRoot, note.cover.replace(/^\//, ""));
        if (fs.existsSync(absPath)) {
          entries.push({ logicalPath: lp, absolutePath: absPath });
        } else {
          report.warnings.push(`[warn] Cover asset not found: ${absPath}`);
        }
      }
    }
  }

  if (entries.length === 0) {
    return { assetsMap: {}, uploaded: 0, reused: 0 };
  }

  if (!r2Configured()) {
    console.warn("[sync] R2 not configured — skipping upload, keeping logical paths");
    const assetsMap: Record<string, string> = {};
    for (const e of entries) assetsMap[e.logicalPath] = oldMap[e.logicalPath] ?? "";
    return { assetsMap, uploaded: 0, reused: 0 };
  }

  const bucketName = process.env.R2_BUCKET_NAME!;
  const cdnBaseUrl = process.env.CDN_BASE_URL!.replace(/\/$/, "");
  const r2 = createR2Client();

  const assetsMap: Record<string, string> = {};
  let uploaded = 0;
  let reused = 0;

  for (const entry of entries) {
    let content: Buffer;
    try {
      content = fs.readFileSync(entry.absolutePath);
    } catch {
      report.warnings.push(`[warn] Cannot read asset: ${entry.absolutePath}`);
      assetsMap[entry.logicalPath] = oldMap[entry.logicalPath] ?? "";
      continue;
    }

    if (content.length === 0) {
      report.warnings.push(`[warn] Asset is 0 bytes, skipping: ${entry.absolutePath}`);
      assetsMap[entry.logicalPath] = oldMap[entry.logicalPath] ?? "";
      continue;
    }

    const newHash = computeContentHash(content);
    const safe = safeFilename(path.basename(entry.logicalPath));
    const r2Key = `images/${newHash}-${safe}`;

    // Dedup: compare content hash embedded in old key
    const oldCdnUrl = oldMap[entry.logicalPath];
    if (oldCdnUrl && oldCdnUrl.startsWith("http")) {
      try {
        const oldKeyPath = new URL(oldCdnUrl).pathname.slice(1); // images/abc123-file.png
        const oldHash = (oldKeyPath.split("/")[1] ?? "").slice(0, 12);
        if (oldHash === newHash) {
          assetsMap[entry.logicalPath] = oldCdnUrl;
          reused++;
          continue;
        }
      } catch {
        // malformed old URL, re-upload
      }
    }

    // Upload
    const ext = path.extname(entry.logicalPath).toLowerCase();
    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: r2Key,
          Body: content,
          ContentType: getContentType(ext),
        })
      );
      const cdnUrl = `${cdnBaseUrl}/${r2Key}`;
      assetsMap[entry.logicalPath] = cdnUrl;
      uploaded++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const relPath = path.relative(process.cwd(), entry.absolutePath);
      console.error(`[error] Upload failed for ${relPath}: ${msg}`);
      report.warnings.push(`[warn] Upload failed — ${entry.logicalPath} has no CDN URL`);
      assetsMap[entry.logicalPath] = oldMap[entry.logicalPath] ?? "";
    }
  }

  return { assetsMap, uploaded, reused };
}

// ── YAML frontmatter serializer ───────────────────────────────────────────────

const DATE_FIELDS = new Set(["pubDatetime", "modDatetime"]);

function fmValue(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return `${key}: []`;
    return `${key}:\n${value.map(v => `  - ${JSON.stringify(v)}`).join("\n")}`;
  }
  if (typeof value === "boolean") return `${key}: ${value}`;
  if (typeof value === "string") {
    if (DATE_FIELDS.has(key) && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return `${key}: ${value}`;
    }
    return `${key}: ${JSON.stringify(value)}`;
  }
  return `${key}: ${value}`;
}

function serializeFrontmatter(data: Record<string, unknown>): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    lines.push(fmValue(key, value));
  }
  lines.push("---");
  return lines.join("\n");
}

// ── Write normalized post ─────────────────────────────────────────────────────

function resolveCoverOutput(
  cover: string | undefined,
  assetsMap: Record<string, string>
): string | undefined {
  if (!cover) return undefined;
  // Remote URLs (featured_image or any http/https cover) are passed through as-is
  if (cover.startsWith("http")) return cover;
  const basename = path.basename(cover);
  const lp = logicalPath(basename);
  // Prefer CDN URL; fall back to logical path for local dev
  return assetsMap[lp] || lp;
}

function writePost(note: ProcessedNote, assetsMap: Record<string, string>): void {
  const pubDate = note.created ?? new Date().toISOString().split("T")[0];
  const fm = serializeFrontmatter({
    title: note.title,
    published: true,
    pubDatetime: pubDate,
    ...(note.updated ? { modDatetime: note.updated } : {}),
    ...(note.description ? { description: note.description } : {}),
    ...(note.excerpt ? { excerpt: note.excerpt } : {}),
    tags: note.tags.length > 0 ? note.tags : ["others"],
    ...(note.cover ? { cover: resolveCoverOutput(note.cover, assetsMap) } : {}),
    ...(note.canonical ? { canonical: note.canonical } : {}),
    ...(note.series ? { series: note.series } : {}),
    lang: note.lang,
    ...(note.translationKey ? { translationKey: note.translationKey } : {}),
    sourcePath: note.sourcePath,
  });

  // Strip leading h1 if it duplicates the frontmatter title
  const bodyStripped = note.body.trim().replace(/^#\s+.+\n?/, "").trim();
  const content = `${fm}\n\n${bodyStripped}\n`;
  const outPath = path.join(OUTPUT_POSTS_DIR, `${note.slug}.md`);
  fs.writeFileSync(outPath, content, "utf-8");
}

// ── Manifest generation ───────────────────────────────────────────────────────

function writeJson(filename: string, data: unknown): void {
  fs.writeFileSync(
    path.join(OUTPUT_GENERATED_DIR, filename),
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  );
}

function writeJsonAtomic(filename: string, data: unknown): void {
  const dest = path.join(OUTPUT_GENERATED_DIR, filename);
  const tmp = dest + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  fs.renameSync(tmp, dest);
}

function generateManifests(
  notes: ProcessedNote[],
  assetsMap: Record<string, string>
): void {
  writeJson(
    "post-index.json",
    notes.map(n => ({
      slug: n.slug,
      title: n.title,
      description: n.description ?? "",
      excerpt: n.excerpt ?? "",
      tags: n.tags,
      series: n.series ?? null,
      created: n.created ?? "",
      updated: n.updated ?? "",
      lang: n.lang,
      translationKey: n.translationKey ?? null,
      outboundLinks: n.outboundLinks,
    }))
  );

  const backlinks: Record<string, Array<{ slug: string; title: string }>> = {};
  for (const note of notes) {
    for (const target of note.outboundLinks) {
      if (!backlinks[target]) backlinks[target] = [];
      if (!backlinks[target].some(b => b.slug === note.slug)) {
        backlinks[target].push({ slug: note.slug, title: note.title });
      }
    }
  }
  writeJson("backlinks.json", backlinks);

  writeJson(
    "unresolved-links.json",
    notes.flatMap(n => n.unresolvedLinks.map(link => ({ sourceSlug: n.slug, link })))
  );

  const tags: Record<Lang, Record<string, string[]>> = { vi: {}, en: {} };
  for (const note of notes) {
    for (const tag of note.tags) {
      if (!tags[note.lang][tag]) tags[note.lang][tag] = [];
      tags[note.lang][tag].push(note.slug);
    }
  }
  for (const lang of VALID_LANGS) {
    tags[lang] = Object.fromEntries(
      Object.entries(tags[lang]).sort(([a], [b]) => a.localeCompare(b))
    );
  }
  writeJson("tags.json", tags);

  const series: Record<Lang, Record<string, string[]>> = { vi: {}, en: {} };
  for (const note of notes) {
    if (!note.series) continue;
    if (!series[note.lang][note.series]) series[note.lang][note.series] = [];
    series[note.lang][note.series].push(note.slug);
  }
  for (const lang of VALID_LANGS) {
    for (const name of Object.keys(series[lang])) {
      series[lang][name].sort((a, b) => {
        const da = notes.find(n => n.slug === a)?.created ?? "";
        const db = notes.find(n => n.slug === b)?.created ?? "";
        return da.localeCompare(db);
      });
    }
  }
  writeJson("series.json", series);

  const translations: Record<string, Partial<Record<Lang, string>>> = {};
  for (const note of notes) {
    if (!note.translationKey) continue;
    if (!translations[note.translationKey]) translations[note.translationKey] = {};
    translations[note.translationKey][note.lang] = note.slug;
  }
  writeJson("translations.json", translations);

  writeJsonAtomic("assets.json", assetsMap);
}

// ── Clean posts output dir ────────────────────────────────────────────────────

function cleanPostsDir(): void {
  fs.mkdirSync(OUTPUT_POSTS_DIR, { recursive: true });
  for (const entry of fs.readdirSync(OUTPUT_POSTS_DIR, { withFileTypes: true })) {
    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      fs.unlinkSync(path.join(OUTPUT_POSTS_DIR, entry.name));
    }
  }
}

// ── Global warning collector ──────────────────────────────────────────────────

const report = { warnings: [] as string[] };

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("[sync] Starting Obsidian → Astro content sync…");

  if (!VAULT_PATH) {
    console.warn("[sync] VAULT_PATH not set — skipping sync.");
    return;
  }

  const vaultPostsPath = path.join(VAULT_PATH, VAULT_POSTS_FOLDER);
  if (!fs.existsSync(vaultPostsPath)) {
    throw new Error(`Vault posts folder not found: ${vaultPostsPath}`);
  }

  // 1. Scan
  const allFiles = findMarkdownFiles(vaultPostsPath);
  const scanned = allFiles.length;

  // 2. Parse + filter
  const hardErrors: string[] = [];
  const rawNotes: ParsedNote[] = [];

  for (const file of allFiles) {
    try {
      const note = parseNote(file, VAULT_PATH);
      if (note) rawNotes.push(note);
    } catch (e) {
      hardErrors.push(String(e));
    }
  }

  if (hardErrors.length > 0) {
    for (const err of hardErrors) console.error(err);
    process.exit(1);
  }

  const published = rawNotes.length;
  const skipped = scanned - published;

  // 3. Duplicate lang+slug check
  const slugLangSeen = new Set<string>();
  for (const note of rawNotes) {
    const key = `${note.lang}:${note.slug}`;
    if (slugLangSeen.has(key)) {
      throw new Error(
        `[error] Duplicate lang+slug: lang=${note.lang} slug="${note.slug}" — found in multiple notes`
      );
    }
    slugLangSeen.add(key);
  }

  // Cross-lang slug collision — flat output file would be overwritten
  const slugOnly = new Set<string>();
  for (const note of rawNotes) {
    if (slugOnly.has(note.slug)) {
      throw new Error(
        `[error] Slug "${note.slug}" used by multiple languages — would overwrite output file`
      );
    }
    slugOnly.add(note.slug);
  }

  // 4. Duplicate translationKey+lang check
  const tlkLangSeen = new Set<string>();
  for (const note of rawNotes) {
    if (!note.translationKey) continue;
    const key = `${note.translationKey}:${note.lang}`;
    if (tlkLangSeen.has(key)) {
      throw new Error(
        `[error] Duplicate translationKey+lang: translationKey="${note.translationKey}" lang=${note.lang}`
      );
    }
    tlkLangSeen.add(key);
  }

  // 5. Build slug map
  const slugMap = buildSlugMap(rawNotes);

  // 6. Process body
  const processedNotes: ProcessedNote[] = rawNotes.map(note => {
    const { body, outboundLinks, unresolvedLinks, assetRefs } = processBody(
      note.body,
      note.lang,
      slugMap
    );
    return { ...note, body, outboundLinks, unresolvedLinks, assetRefs };
  });

  // 7. Upload assets to R2
  const vaultFileIndex = buildVaultFileIndex(VAULT_PATH);
  const { assetsMap, uploaded, reused } = await uploadAssets(
    processedNotes,
    VAULT_PATH,
    vaultFileIndex
  );

  // 8. Write normalized posts
  cleanPostsDir();
  fs.mkdirSync(OUTPUT_GENERATED_DIR, { recursive: true });
  for (const note of processedNotes) writePost(note, assetsMap);

  // 9. Generate manifests (includes updated assets.json)
  generateManifests(processedNotes, assetsMap);

  // 10. Collect unresolved link warnings
  for (const note of processedNotes) {
    for (const link of note.unresolvedLinks) {
      report.warnings.push(
        `[warn] Unresolved wikilink '[[${link}]]' in: ${note.sourcePath}`
      );
    }
  }

  // 11. Print report
  const totalResolved = processedNotes.reduce((n, p) => n + p.outboundLinks.length, 0);
  const totalUnresolved = processedNotes.reduce((n, p) => n + p.unresolvedLinks.length, 0);
  const totalAssets = processedNotes.reduce((n, p) => n + p.assetRefs.length, 0);

  console.log();
  console.log("[sync] ──────────────────────────────────────");
  console.log(`[sync]  Scanned notes:          ${scanned}`);
  console.log(`[sync]  Published notes:        ${published}`);
  console.log(`[sync]  Skipped notes:          ${skipped}`);
  console.log(`[sync]  Hard errors:            ${hardErrors.length}`);
  console.log(`[sync]  Resolved wikilinks:     ${totalResolved}`);
  console.log(`[sync]  Unresolved wikilinks:   ${totalUnresolved}`);
  console.log(`[sync]  Asset refs collected:   ${totalAssets}`);
  console.log(`[sync]  Images uploaded:        ${uploaded}`);
  console.log(`[sync]  Images reused (cached): ${reused}`);
  console.log("[sync] ──────────────────────────────────────");

  if (report.warnings.length > 0) {
    console.log();
    for (const w of report.warnings) console.warn(w);
  }

  console.log("\n[sync] Done.");
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error("\n[sync] Fatal:", msg);
  process.exit(1);
});
