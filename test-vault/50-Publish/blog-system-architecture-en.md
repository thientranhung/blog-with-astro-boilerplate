---
title: "Blog System Architecture: Obsidian → Astro"
published: true
slug: blog-system-architecture
description: "A complete overview of the pipeline from Obsidian vault to Cloudflare Workers, illustrated with Mermaid diagrams."
tags: [obsidian, astro, pipeline, cloudflare]
series: "obsidian-to-astro"
lang: en
translationKey: "blog-system-architecture"
created: 2026-05-20
updated: 2026-05-20
---

# Blog System Architecture: Obsidian → Astro

This post describes the full data flow from writing notes in Obsidian to a blog post appearing on the internet.

## Data Flow Overview

```mermaid
flowchart LR
    A([🗒️ Obsidian Vault]) --> B[Sync Pipeline\nTypeScript]
    B --> C[(src/content/\nposts/*.md)]
    B --> D[(generated/\n*.json)]
    B --> E[(Cloudflare R2\nImages)]
    C --> F[Astro Build]
    D --> F
    E --> F
    F --> G([🌐 Cloudflare Workers])
```

## Sync Pipeline Detail

The pipeline runs `pnpm sync` before every build. It performs 6 sequential steps:

```mermaid
flowchart TD
    A[Scan vault] --> B{published: true?}
    B -- No --> Z[Skip]
    B -- Yes --> C[Parse frontmatter\n& body]
    C --> D[Resolve wikilinks\n& assets]
    D --> E[Upload images → R2]
    E --> F[Write .md\nnormalized]
    F --> G[Generate manifests\nJSON]
```

## Manifest Relationships

The JSON files in `src/content/generated/` serve different purposes:

```mermaid
erDiagram
    POST {
        string slug
        string lang
        string translationKey
        string[] tags
        string series
    }
    BACKLINKS {
        string target_slug
        string[] source_slugs
    }
    TRANSLATIONS {
        string translationKey
        string vi_slug
        string en_slug
    }
    TAGS {
        string tag
        string[] slugs
    }
    POST ||--o{ BACKLINKS : "referenced by"
    POST ||--o| TRANSLATIONS : "paired with"
    POST }o--o{ TAGS : "tagged with"
```

## Deploy Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Actions
    participant CF as Cloudflare Workers

    Dev->>GH: git push main
    GH->>GH: pnpm sync
    GH->>GH: pnpm build
    GH->>CF: wrangler deploy
    CF-->>Dev: ✅ Live at blog.example.com
```

## Conclusion

This pipeline keeps Astro completely decoupled from the vault — Astro only reads normalized output and never touches Obsidian directly.

> [!note]
>
> See how wikilinks and backlinks work in [[backlinks-and-wikilinks]].
