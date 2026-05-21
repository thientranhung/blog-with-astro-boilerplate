# My Astro Blog Docs

Đây là entry point cho tài liệu thiết kế dự án Astro blog dùng nội dung từ Obsidian và hạ tầng Cloudflare.

## Đọc Theo Thứ Tự

1. [Project Architecture](docs/project-architecture.md)
   Tổng quan mục tiêu, stack, kiến trúc, phạm vi v1, rủi ro và lộ trình.

2. [ADR-002: Dùng AstroPaper làm base theme](docs/decisions/adr-002-use-astropaper-as-base-theme.md)
   Quyết định theme dùng để init project.

3. [ADR-001: Không dùng astro-loader-obsidian làm backbone](docs/decisions/adr-001-obsidian-content-pipeline-decision.md)
   Quyết định kiến trúc cho content pipeline.

4. [Content Pipeline Spec](docs/content-pipeline-spec.md)
   Contract chi tiết cho `Obsidian -> Astro` sync pipeline.

5. [Design.md](docs/design.md)
   Canonical light-mode-default design tokens, palette, typography, layout rules và rationale để coding agents giữ visual identity nhất quán.

6. [Design System Handoff](docs/design-system/README.md)
   Bản bàn giao designer: dark mode source `DESIGN.md`, screenshots và HTML wireframes cho Home, Post Detail, Tags, Search.

7. [External Research: Obsidian to Astro](docs/external-research-obsidian-astro.md)
   Nguồn tham khảo, thư viện, theme và nhận định sau research.

## Quyết Định Đã Chốt

- Base theme: `AstroPaper`
- Deploy target: `Cloudflare Workers + Static Assets`
- Asset storage: `Cloudflare R2`
- Content source: `Obsidian Vault`
- Content strategy: custom `Obsidian -> Astro sync pipeline`
- Backlinks: sinh build-time từ link graph
- Dataview: không chạy runtime, thay bằng generated manifests
- Visual system: light-mode-default `docs/design.md` làm nguồn token và rationale cho UI
- Designer handoff: lưu tại `docs/design-system/dark-mode/`

## Bước Tiếp Theo

1. Init project từ `AstroPaper`.
2. Chạy local để xem theme nguyên bản.
3. Rà content schema/collection convention của AstroPaper.
4. Gắn custom sync pipeline theo [Content Pipeline Spec](docs/content-pipeline-spec.md).
