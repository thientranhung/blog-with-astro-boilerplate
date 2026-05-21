# Astro Obsidian Blog Boilerplate

A professional, high-performance boilerplate for creating a personal blog with Astro (using the AstroPaper theme), syncing your content directly from an Obsidian vault, and deploying to Cloudflare Workers.

## Personalization & Customization

To turn this boilerplate into your own personal blog, follow these steps:

1. **Configure Site Metadata**:
   Open [astro-paper.config.ts](file:///Users/tranthien/Documents/2.DEV/3.BLOGS/my-blog-with-astro-boilerplate/astro-paper.config.ts) and modify the `site` and `socials` properties to match your details:
   - `url`: Your production website domain (e.g., `https://yourdomain.com`).
   - `title`: The title of your blog.
   - `description`: The meta description for SEO.
   - `author`: Your name.
   - `profile`: Your primary profile link (e.g. your GitHub profile).
   - `socials`: Update URLs for GitHub, X, LinkedIn, etc.

2. **Configure package.json**:
   Open [package.json](file:///Users/tranthien/Documents/2.DEV/3.BLOGS/my-blog-with-astro-boilerplate/package.json) and modify `name` and `description` to match your personal repository details.

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your settings:
   - `VAULT_PATH`: The absolute path to your Obsidian vault.
   - `VAULT_POSTS_FOLDER`: The folder name in Obsidian where your notes to publish are stored (default: `50-Publish`).
   - (Optional) Configure Cloudflare R2 credentials if you want to automatically upload local Obsidian images to Cloudflare R2 CDN.

4. **Customize CSS and Styling**:
   - Customize your theme colors, fonts, and CSS variables in [src/styles/theme.css](file:///Users/tranthien/Documents/2.DEV/3.BLOGS/my-blog-with-astro-boilerplate/src/styles/theme.css) or modify the layouts under `src/layouts/`.

## How it works

```
Obsidian Vault (50-Publish/)
    └─→ pnpm run sync          ← transform pipeline
            ├─→ src/content/posts/*.md
            └─→ src/content/generated/*.json
Astro (AstroPaper theme)
    └─→ pnpm run deploy        ← build + deploy to Cloudflare Workers
```

Astro never reads the vault directly — it only sees the normalized output from `sync`.

## Publishing a post

1. In Obsidian, add to the note's frontmatter:
   ```yaml
   publish_status: publish
   ```
2. Run sync + deploy:
   ```bash
   pnpm run sync    # pull from Obsidian vault
   pnpm run deploy  # build + deploy to Cloudflare
   ```

To preview locally before deploying:
```bash
pnpm run sync
pnpm dev          # http://localhost:4322
```

## Frontmatter schema

```yaml
title: "Required"

# Publish trigger — either works:
publish_status: publish
published: true

# Optional fields:
slug: "custom-url-slug"          # falls back to slugified filename
short_description: "..."         # alias for description
description: "..."
featured_image: "https://..."    # remote URL — alias for cover
cover: "/Assets/local.jpg"       # local vault path
tags: [tag1, tag2]
series: "series-name"
lang: vi                         # "vi" (default) or "en"
translationKey: "some-key"       # links VI/EN post pairs
created: 2026-05-20
updated: 2026-05-20
canonical: "https://..."
```

## Supported Obsidian syntax

| Syntax | Output |
|--------|--------|
| `[[note]]`, `[[note\|alias]]` | Internal link |
| `[[#heading\|alias]]` | In-page anchor link |
| `![[image.png]]` | Image (uploaded to R2) |
| `> [!note]`, `[!warning]`, `[!tip]`, etc. | Styled callout |
| `==highlight==` | `<mark>` yellow highlight |
| `%%comment%%` | Stripped (not rendered) |
| `^block-id` | Stripped |
| `~~strikethrough~~`, tables, `- [ ]` tasks, `[^footnote]` | Via GFM |
| Mermaid code blocks | Client-side rendered |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm run sync` | Sync Obsidian vault → `src/content/` |
| `pnpm dev` | Dev server at localhost:4322 |
| `pnpm run build` | Build to `dist/` (for local preview/debug) |
| `pnpm preview` | Preview production build locally |
| `pnpm run deploy` | Build + deploy to Cloudflare Workers |

## Environment variables

Copy `.env.example` to `.env`:

```bash
VAULT_PATH=/path/to/your/obsidian/vault
VAULT_POSTS_FOLDER=50-Publish

# Cloudflare R2 (for image uploads)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
CDN_BASE_URL=

# Cloudflare Workers deploy
CF_API_TOKEN=       # needs "Workers Scripts: Edit" permission
CF_ACCOUNT_ID=
```

## Tech stack

- **[Astro v6](https://astro.build)** + **[AstroPaper v6](https://github.com/satnaing/astro-paper)** — SSG framework + theme
- **[Cloudflare Workers](https://workers.cloudflare.com)** — hosting
- **[Cloudflare R2](https://developers.cloudflare.com/r2/)** — image storage
- **[Tailwind CSS v4](https://tailwindcss.com)** — styling
- **[Shiki](https://shiki.style)** — code syntax highlighting
- **[Pagefind](https://pagefind.app)** — static search
- **[rehype-callouts](https://github.com/lin-stephanie/rehype-callouts)** — Obsidian callout rendering
