---
title: "Lưu trữ ảnh với Cloudflare R2"
published: true
slug: cloudflare-r2-image-storage
description: "Cách pipeline upload ảnh từ Obsidian vault lên Cloudflare R2 và rewrite URL."
excerpt: "Content-hash asset keys, dedup upload, và remark plugin rewrite."
tags:
  - cloudflare
  - r2
  - images
  - pipeline
series: obsidian-to-astro
lang: vi
created: 2026-05-12
updated: 2026-05-14
---

# Lưu trữ ảnh với Cloudflare R2

Mọi ảnh trong Obsidian vault được upload lên Cloudflare R2 với key ổn định theo content hash.

## Asset key strategy

```
images/<sha256-12chars>-<safe-filename>.ext
```

Lợi ích:
- Đổi tên file local không làm gãy URL CDN
- Dễ deduplicate: nếu nội dung không đổi, key không đổi

## Ảnh trong bài viết

Liên quan đến [[backlinks-va-wikilinks]] về cách xử lý image embed.

![[r2-architecture.png]]

![[test-real-image.png]]

## Callout warning

> [!warning]
> `cover` khai báo trong frontmatter của bài published nhưng file không tồn tại trong vault sẽ khiến pipeline abort.
