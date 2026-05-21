---
title: "Kiến trúc hệ thống blog Obsidian → Astro"
published: true
slug: kien-truc-he-thong-blog
description: "Toàn cảnh pipeline từ Obsidian vault đến Cloudflare Workers, minh họa bằng sơ đồ Mermaid."
tags: [obsidian, astro, pipeline, cloudflare]
series: "obsidian-to-astro"
lang: vi
translationKey: "blog-system-architecture"
created: 2026-05-20
updated: 2026-05-20
---

# Kiến trúc hệ thống blog Obsidian → Astro

Bài này mô tả toàn bộ luồng dữ liệu từ lúc viết ghi chú trong Obsidian đến khi bài blog xuất hiện trên internet.

## Tổng quan luồng dữ liệu

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

## Chi tiết sync pipeline

Pipeline chạy lệnh `pnpm sync` trước mỗi lần build. Nó thực hiện 6 bước tuần tự:

```mermaid
flowchart TD
    A[Scan vault] --> B{published: true?}
    B -- Không --> Z[Bỏ qua]
    B -- Có --> C[Parse frontmatter\n& body]
    C --> D[Resolve wikilinks\n& assets]
    D --> E[Upload ảnh → R2]
    E --> F[Write .md\nnormalized]
    F --> G[Generate manifests\nJSON]
```

## Quan hệ giữa các manifest

Các file JSON trong `src/content/generated/` phục vụ những mục đích khác nhau:

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

## Deploy flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Actions
    participant CF as Cloudflare Workers

    Dev->>GH: git push main
    GH->>GH: pnpm sync
    GH->>GH: pnpm build
    GH->>CF: wrangler deploy
    CF-->>Dev: ✅ Live tại blog.example.com
```

## Kết luận

Pipeline này giữ Astro hoàn toàn tách biệt với vault — Astro chỉ đọc output đã được normalize, không bao giờ đọc trực tiếp từ Obsidian.

> [!note]
>
> Xem thêm cách wikilink và backlink hoạt động trong [[backlinks-va-wikilinks]].
