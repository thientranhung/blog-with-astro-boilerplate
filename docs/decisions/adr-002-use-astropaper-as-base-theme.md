# ADR-002: Dùng AstroPaper làm base theme

## Trạng thái

Accepted

## Ngày

2026-04-24

## Bối cảnh

Dự án cần một Astro blog có thể chạy local nhanh, dùng markdown/content collections tốt, và đủ đơn giản để gắn thêm pipeline nội dung từ Obsidian.

Sau khi tham khảo các hướng theme Astro cho blog kỹ thuật và knowledge base, các option đáng chú ý gồm:

- `AstroPaper`: minimal blog, markdown-first, tags, search, RSS, sitemap, SEO
- `Astro Starlight`: mạnh cho documentation site
- `astro-erudite`: hợp developer blog có code/MDX/LaTeX
- các theme blog nhỏ khác như Astro Cactus hoặc theme personal blog tối giản

## Quyết định

Dùng `AstroPaper` làm base theme cho giai đoạn init project.

Preview UI của dự án sẽ đi theo hướng:

- base layout và blog primitives từ `AstroPaper`
- thêm các thành phần riêng cho Obsidian:
  - backlinks panel
  - wikilink style
  - tags/archive mở rộng
  - optional graph/related notes panel
  - R2 image handling

## Lý do

### 1. Phù hợp với blog markdown-first

AstroPaper đã được thiết kế cho blog cá nhân dùng Markdown, nên gần với nhu cầu cốt lõi của dự án hơn một docs framework thuần như Starlight.

### 2. Ít opinionated hơn các theme knowledge base

Dự án cần custom pipeline từ Obsidian. Một theme quá nặng về knowledge base có thể ép kiến trúc UI/content vào abstraction của nó.

AstroPaper đủ gọn để sửa, nhưng vẫn có sẵn các mảnh quan trọng cho blog production.

### 3. Có sẵn nhiều tính năng blog cơ bản

AstroPaper có thể làm nền cho:

- posts list
- tag pages
- RSS
- sitemap
- SEO metadata
- search
- dark/light mode

Những phần này giúp giai đoạn đầu tập trung vào `Obsidian -> Astro pipeline` thay vì tự dựng lại toàn bộ blog shell.

### 4. Dễ mở rộng cho Obsidian-specific UI

Các tính năng như backlinks, wikilink chips, hoặc graph mini panel có thể được thêm dần vào article layout và sidebar mà không phải thay đổi toàn bộ theme.

## Hệ quả

### Tích cực

- Có UI chạy local nhanh hơn.
- Giảm công sức dựng blog shell.
- Giữ được hướng minimal, content-first.
- Dễ customize để thêm Obsidian features.

### Tiêu cực

- Cần đọc và làm theo structure của AstroPaper trước khi sửa.
- Một số phần content schema của AstroPaper có thể cần chỉnh để khớp pipeline riêng.
- Có thể phải đổi tên collection hoặc adapter layer nếu theme dùng convention khác spec ban đầu.

## Kế hoạch áp dụng

1. Init project từ AstroPaper.
2. Chạy local để kiểm tra theme nguyên bản.
3. Rà cấu trúc content/schema của theme.
4. Điều chỉnh docs/spec nếu collection names khác dự kiến.
5. Thêm custom Obsidian sync pipeline phía sau theme.
6. Mở rộng article layout cho backlinks, wikilinks, tags, và R2 images.

