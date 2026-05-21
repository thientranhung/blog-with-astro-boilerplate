# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is **implemented and running** (Phase 4 complete). Local dev is fully functional at `localhost:4322`. Production is live at `https://blog.example.com` via **Cloudflare Pages** — deploys automatically when `main` is pushed to GitHub.

## Project Goal

A personal blog built with:
- **Astro** (SSG) + **AstroPaper** as the base theme
- Content sourced from **Obsidian Vault** — only notes with `published: true` or `publish_status: publish` are synced
- **Cloudflare Pages** for hosting (Git-integrated, auto-deploy on push to `main`)
- **Cloudflare R2** for image storage

## Commands

```bash
# Local development
pnpm run sync          # sync Obsidian vault → src/content/ (run before dev/build)
pnpm dev               # astro dev (localhost:4322)
pnpm build             # astro build (local verify only)
pnpm preview           # astro preview

# Publish to production (one command)
pnpm run deploy        # = bash scripts/publish-blog.sh
                       #   → sync → git commit → git push → Cloudflare Pages auto-deploys
```

The sync script must run before `astro dev` or `astro build` — Astro reads only the normalized output, not the raw vault.

**Deploy flow:** Cloudflare Pages is connected to the `main` branch on GitHub. Pushing `main` triggers an automatic build (`pnpm run build`) and deploy on Cloudflare's side. The vault content (`src/content/posts/`, `src/content/generated/`) is committed to git — Cloudflare Pages does NOT run the sync step.

## Architecture

The core of this project is the **Obsidian → Astro content sync pipeline**, not Astro or Cloudflare themselves.

```
Obsidian Vault
    └─→ scripts/sync-obsidian-content.ts   ← custom pipeline (the hard part)
            ├─→ src/content/posts/*.md      ← normalized markdown
            └─→ src/content/generated/
                    ├── post-index.json
                    ├── backlinks.json
                    ├── unresolved-links.json
                    ├── tags.json
                    ├── series.json
                    └── assets.json
Astro (AstroPaper theme)
    └─→ reads src/content/ only — never reads from vault directly
Cloudflare R2
    └─→ receives uploaded images from sync pipeline
```

**Design principle**: Astro sees only already-normalized data. The sync pipeline is the single point of transformation.

## Content Pipeline Rules

### Publish filter
A note syncs only if its frontmatter has **either**:
- `published: true`  ← original format
- `publish_status: publish`  ← user's actual Obsidian template format

### Frontmatter schema (Obsidian source)

The pipeline accepts two equivalent forms for several fields:

```yaml
title: "required"

# Publish trigger — either form works:
published: true
# OR
publish_status: publish

slug: "preferred-url-slug"       # optional; falls back to slugified filename

# Description — either field name works:
description: "short description"
# OR
short_description: "short description"

tags: [astro, cloudflare]
series: "series-name"
lang: vi                          # "vi" (default) or "en"
translationKey: "some-key"        # links bilingual post pairs
created: 2026-04-23
updated: 2026-04-23

# Cover image — either field name works:
cover: "/Assets/hero.jpg"         # local vault path
# OR
featured_image: "https://..."     # remote URL (R2 or any CDN) — skips existence check

canonical: "https://..."
```

**Field aliasing**: `short_description` → `description`, `featured_image` → `cover`. If both are present, the canonical field (`description`, `cover`) takes precedence.

### Slug resolution
1. `frontmatter.slug` (preferred)
2. Slugified filename (fallback)

Duplicate slugs must **fail hard** (pipeline error, not a warning).

### Wikilink resolution
- `[[note]]` → `[note](/note/)` if target is in published set
- `[[note|label]]` → `[label](/note/)` with alias as display text
- Unresolvable links: keep plain text, write to `unresolved-links.json`, log warning
- Never create a broken internal link

### Backlinks
Generated build-time from the reversed outbound link graph. Stored in `backlinks.json` — not computed at runtime in UI.

### Image / Asset handling
- Asset key on R2: `images/<content-hash>-<safe-filename>.ext` (stable across renames)
- Normalized markdown keeps a **logical path** (not a hardcoded CDN URL)
- A remark plugin rewrites logical paths → CDN URLs at Astro build time (Approach B in spec)
- This ensures local preview and production use the same render path

### Dataview
Not supported at runtime. Replaced by static manifests generated at sync time: `series.json`, `tags.json`, `post-index.json`.

### Hard errors (pipeline must abort)
- Duplicate slugs
- Published note missing `title`
- Markdown that cannot be parsed
- `cover` (or `featured_image`) declared as a **local path** in a published note but the file cannot be resolved on disk (remote `http/https` URLs are skipped)

### Warnings (log, continue)
- Unresolvable wikilinks
- Unused assets
- Extra frontmatter fields outside schema

## Key Architectural Decisions

**ADR-001** — Do NOT use `astro-loader-obsidian` as the pipeline backbone. Reasons: it lacks deterministic slug maps, no R2/CDN asset strategy, no generated manifest artifacts, and no reporting. Learned from: parse patterns for wikilinks and embeds.

**ADR-002** — Use AstroPaper as the base theme. It provides tags, RSS, sitemap, SEO, search, and dark/light mode out of the box, letting early phases focus on the sync pipeline rather than blog scaffolding.

## Git Workflow

Branches: `milestone/<name>`, `phase/<N>-<desc>`, `fix/<desc>`, `quick/<desc>`

Never commit directly to `develop` or `master`. Never auto-commit — wait for explicit instruction. Commit convention: `feat(phase-N):`, `fix(phase-N):`, `refactor:`, `test:`, `docs:`.

## Implementation Phases

1. **Phase 1** — Init from AstroPaper, run theme locally, audit content schema
2. **Phase 2** — Wikilinks, backlinks, tags, callouts
3. **Phase 3** — R2 image upload + URL rewrite
4. **Phase 4** — Dataview replacement patterns, search, related posts

## Docs

- [`docs/project-architecture.md`](docs/project-architecture.md) — full architecture, data flow diagrams, risk analysis
- [`docs/content-pipeline-spec.md`](docs/content-pipeline-spec.md) — detailed pipeline contract (frontmatter schema, slug rules, link resolution, asset strategy, output artifacts)
- [`docs/decisions/adr-001-obsidian-content-pipeline-decision.md`](docs/decisions/adr-001-obsidian-content-pipeline-decision.md)
- [`docs/decisions/adr-002-use-astropaper-as-base-theme.md`](docs/decisions/adr-002-use-astropaper-as-base-theme.md)
