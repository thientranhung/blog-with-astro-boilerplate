---
title: "Giới thiệu pipeline Obsidian → Astro"
published: true
slug: gioi-thieu-obsidian-astro
description: "Tổng quan về cách sync nội dung từ Obsidian sang Astro SSG."
excerpt: "Pipeline tự động chuyển ghi chú Obsidian thành bài blog Astro."
tags:
  - obsidian
  - astro
  - pipeline
series: obsidian-to-astro
lang: vi
translationKey: intro-obsidian-astro
created: 2026-05-01
updated: 2026-05-10
cover: /Assets/hero-pipeline.png
---

# Giới thiệu pipeline Obsidian → Astro

Bài viết này giới thiệu cách tôi xây dựng pipeline tự động sync nội dung từ Obsidian vault sang blog Astro.

## Lý do

Obsidian là công cụ ghi chú tôi dùng hàng ngày. Tôi muốn publish thẳng từ vault mà không cần copy-paste thủ công.

## Kiến trúc

Pipeline gồm 3 bước:

1. Scan vault, lọc note có `published: true`
2. Resolve wikilinks, upload ảnh lên R2
3. Generate JSON manifests cho Astro

Xem thêm [[backlinks-va-wikilinks]] để hiểu cách link giữa các bài.

> [!note]
> Pipeline chạy trước `astro dev` và `astro build`. Astro chỉ đọc output đã normalize.

![[hero-pipeline.png]]
