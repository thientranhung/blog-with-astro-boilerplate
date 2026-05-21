---
title: "Backlinks và Wikilinks trong pipeline"
published: true
slug: backlinks-va-wikilinks
description: "Cách pipeline resolve wikilinks và tạo backlinks tĩnh."
tags:
  - obsidian
  - pipeline
  - backlinks
series: obsidian-to-astro
lang: vi
translationKey: backlinks-wikilinks
created: 2026-05-05
updated: 2026-05-11
---

# Backlinks và Wikilinks trong pipeline

Một trong những tính năng quan trọng nhất của Obsidian là wikilinks — liên kết giữa các ghi chú bằng cú pháp `[[tên note]]`.

## Wikilinks

Ví dụ wikilink cơ bản:

- Liên kết thường: [[gioi-thieu-obsidian-astro]]
- Liên kết có alias: [[gioi-thieu-obsidian-astro|xem bài giới thiệu]]
- Liên kết chưa tồn tại (unresolved): [[bai-chua-viet]]

## Backlinks

Pipeline đảo graph outbound links để sinh `backlinks.json`. Bài A link bài B → bài B có backlink từ A.

> [!warning]
> Wikilink không resolve được sẽ bị giữ nguyên dạng text và ghi vào `unresolved-links.json`.

## Ảnh nhúng

Cú pháp Obsidian image embed:

![[screenshot-pipeline.png]]

Pipeline sẽ resolve path này sang đường dẫn logic, sau đó remark plugin rewrite sang CDN URL.
