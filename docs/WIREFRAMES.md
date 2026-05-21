# Wireframes — my-astro-blog

> **Tạo:** 2026-05-18
> Mô tả layout các trang chính. Base theme: AstroPaper v6.

---

## 1. Home Page

```
┌─────────────────────────────────────────────────────┐
│  Blog Title          Home  Posts  Tags  About  VI/EN 🔍🌙│
├─────────────────────────────────────────────────────┤
│                                                     │
│                    Blog Title                       │
│             Tagline / description ngắn              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ★ Recent posts                                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Tiêu đề bài viết 1                          │    │
│  │ 2026-05-15 · Example Author                     │    │
│  │ Mô tả ngắn về nội dung bài viết...          │    │
│  │ [astro] [obsidian]                           │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Tiêu đề bài viết 2                          │    │
│  │ 2026-05-10 · Example Author                     │    │
│  │ Mô tả ngắn về nội dung bài viết...          │    │
│  │ [cloudflare] [r2]                            │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Tiêu đề bài viết 3                          │    │
│  │ 2026-05-05 · Example Author                     │    │
│  │ Mô tả ngắn về nội dung bài viết...          │    │
│  │ [pipeline]                                   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│                  [ All posts → ]                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│          © 2026 Blog Title · RSS · Sitemap          │
└─────────────────────────────────────────────────────┘
```

### Components

| Vùng | Component | Nguồn dữ liệu |
|------|-----------|----------------|
| Header | Nav links + language switcher + search icon + theme toggle | `astro-paper.config.ts` + `translations.json` |
| Hero | Site title + description | `astro-paper.config.ts` |
| Recent posts | Post cards (title, date, author, desc, tags) | `post-index.json` hoặc Astro content collection |
| Footer | Copyright, RSS link, sitemap link | Static |

### Ghi chú

- Số bài hiển thị trên trang chủ: config `posts.perIndex` (default 4)
- Post card link tới `/{lang}/posts/{slug}/`
- Tags link tới `/{lang}/tags/{tag}/`
- Home chỉ hiển thị posts theo ngôn ngữ hiện tại

---

## 2. Post Detail

```
┌─────────────────────────────────────────────────────┐
│  Blog Title          Home  Posts  Tags  About  VI/EN 🔍🌙│
├─────────────────────────────────────────────────────┤
│  ← Back                                            │
│                                      Read in English│
│                                                     │
│  Tiêu đề bài viết                                  │
│  2026-05-15 · Updated 2026-05-17 · Example Author      │
│  [astro] [obsidian]                                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │                                             │    │
│  │           Cover image (R2 CDN)              │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Table of contents                                  │
│  ├── Heading 1                                      │
│  ├── Heading 2                                      │
│  └── Heading 3                                      │
│                                                     │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                                     │
│  Markdown body                                      │
│                                                     │
│  - Wikilinks → resolved internal links              │
│  - Images → rewritten to R2 CDN URLs                │
│  - Callouts → styled blocks (note/warning/tip)      │
│  - Code blocks → syntax highlighted (Shiki)         │
│                                                     │
│  ┌─ Callout ─────────────────────────────────┐      │
│  │ > [!note]                                  │      │
│  │ > Nội dung callout                         │      │
│  └────────────────────────────────────────────┘      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔗 Backlinks                                       │
│  ┌──────────┐ ┌──────────┐                          │
│  │ Post A → │ │ Post C → │                          │
│  └──────────┘ └──────────┘                          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📚 Series: obsidian-to-astro                       │
│  [ 1. Intro ] [▶ 2. Pipeline ] [ 3. Deploy ]       │
│                  (current)                          │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ← Previous post              Next post →          │
├─────────────────────────────────────────────────────┤
│  Share: WhatsApp · Facebook · X · Telegram          │
├─────────────────────────────────────────────────────┤
│          © 2026 Blog Title · RSS · Sitemap          │
└─────────────────────────────────────────────────────┘
```

### Components

| Vùng | Component | Nguồn dữ liệu |
|------|-----------|----------------|
| Post meta | Title, dates, author, tags | Post frontmatter |
| Language switcher | Link sang bản dịch cùng `translationKey` | `translations.json` |
| Cover image | `<img>` từ R2 CDN URL | `assets.json` → remark plugin rewrite |
| TOC | Auto-generated từ headings | `remark-toc` (AstroPaper built-in) |
| Markdown body | Rendered HTML | Astro content collection + remark/rehype |
| Backlinks | Chips link tới incoming posts | `backlinks.json` |
| Series nav | Ordered list, highlight current | `series.json` |
| Prev/Next | Adjacent posts by date | Astro content collection sort |
| Share | Social share links | `astro-paper.config.ts` shareLinks |

### Markdown transforms trong body

| Input (Obsidian) | Output (HTML) |
|-------------------|---------------|
| `[[note-name]]` | `<a href="/slug/">note-name</a>` |
| `[[note\|label]]` | `<a href="/slug/">label</a>` |
| `![[image.png]]` | `<img src="https://cdn.example.com/images/abc123-image.png">` |
| `> [!note] Title` | `<div class="callout callout-note"><p class="callout-title">Title</p>...</div>` |
| `` ```python `` | Shiki syntax highlight |

### Ghi chú

- Backlinks panel ẩn nếu không có incoming links
- Series nav ẩn nếu post không thuộc series nào
- Cover image ẩn nếu frontmatter không có `cover`
- TOC collapsible (AstroPaper built-in via `remark-collapse`)
- Language switcher ẩn hoặc disabled nếu bài chưa có bản dịch
- Backlinks và series ưu tiên bài cùng ngôn ngữ

---

## 3. Tag Archive

```
┌─────────────────────────────────────────────────────┐
│  Blog Title          Home  Posts  Tags  About  VI/EN 🔍🌙│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Tags                                               │
│                                                     │
│  [astro (5)] [obsidian (4)] [cloudflare (3)]        │
│  [pipeline (2)] [r2 (2)] [wikilink (1)]             │
│                                                     │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                                     │
│  Tag: astro (5 posts)                               │
│  ─────────────────────                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Post title                     2026-05-15   │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │ Post title                     2026-05-10   │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │ Post title                     2026-05-05   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│              « Prev  [1]  2  Next »                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│          © 2026 Blog Title · RSS · Sitemap          │
└─────────────────────────────────────────────────────┘
```

### Components

| Vùng | Component | Nguồn dữ liệu |
|------|-----------|----------------|
| Tag cloud | Tag chips với post count | `tags.json` |
| Filtered list | Post cards (compact: title + date) | Astro content collection filtered by tag |
| Pagination | Page nav | AstroPaper built-in |

### Ghi chú

- URL pattern: `/{lang}/tags/{tag}/` và `/{lang}/tags/{tag}/{page}/`
- Tag cloud hiển thị tất cả tags, sorted by count (desc)
- Click tag → filter danh sách bên dưới
- Posts per page: config `posts.perPage` (default 4)
- Tag count tính theo ngôn ngữ hiện tại

---

## 4. Search

```
┌─────────────────────────────────────────────────────┐
│  Blog Title          Home  Posts  Tags  About  VI/EN 🔍🌙│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Search                                             │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🔍 Search posts...                          │    │
│  └─────────────────────────────────────────────┘    │
│  Powered by Pagefind (static search, no server)     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Matching post title                         │    │
│  │ ...highlighted [keyword] in context...      │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Another matching post                       │    │
│  │ ...more [keyword] matches...                │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│          © 2026 Blog Title · RSS · Sitemap          │
└─────────────────────────────────────────────────────┘
```

### Components

| Vùng | Component | Nguồn dữ liệu |
|------|-----------|----------------|
| Search input | Text field | User input |
| Results | Post cards với highlighted context | Pagefind index (build-time) |

### Ghi chú

- Pagefind là static search — index sinh lúc build, không cần server
- AstroPaper đã tích hợp sẵn Pagefind
- Highlight keyword match trong context snippet
- No results state: hiển thị message rõ ràng
- Search mặc định lọc theo ngôn ngữ hiện tại; có thể thêm filter "All languages" sau V1

---

## 5. Series Page

```
┌─────────────────────────────────────────────────────┐
│  Blog Title          Home  Posts  Tags  About  VI/EN 🔍🌙│
├─────────────────────────────────────────────────────┤
│                                                     │
│  Series: Obsidian to Astro                          │
│  3 posts in this series                             │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1  Introduction                  2026-04-20 │    │
│  └─────────────────────────────────────────────┘    │
│  ┌═════════════════════════════════════════════┐    │
│  ║ 2  Content pipeline (current)    2026-04-25 ║    │
│  └═════════════════════════════════════════════┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │ 3  Deploy to Cloudflare          2026-05-01 │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│          © 2026 Blog Title · RSS · Sitemap          │
└─────────────────────────────────────────────────────┘
```

### Components

| Vùng | Component | Nguồn dữ liệu |
|------|-----------|----------------|
| Series header | Name + post count | `series.json` |
| Post list | Numbered, ordered by `created` | `series.json` + content collection |
| Current highlight | Border/bg accent trên bài đang xem | URL match |

### Ghi chú

- Series page có thể là standalone `/series/{name}/` hoặc chỉ là component trong post detail
- Posts sorted by `created` date (ascending) trong cùng series
- Bài hiện tại highlight bằng accent border
- Series page và post detail series nav là **Phase 4**; Phase 2 chỉ sinh `series.json`
- Series list và post count tính theo ngôn ngữ hiện tại

---

## 6. Multilingual Model

### Content contract

Mỗi bản ngôn ngữ là một markdown note riêng, nhưng cùng một logical article qua `translationKey`.

```yaml
title: "Content Pipeline"
published: true
lang: "en"
translationKey: "content-pipeline"
slug: "content-pipeline"
created: "2026-05-15"
updated: "2026-05-17"
tags: ["astro", "obsidian"]
series: "obsidian-to-astro"
```

Bản tiếng Việt dùng cùng `translationKey`, nhưng `lang: "vi"` và có thể có `slug` riêng:

```yaml
title: "Content pipeline"
published: true
lang: "vi"
translationKey: "content-pipeline"
slug: "content-pipeline"
```

### URL pattern

| Page | Vietnamese | English |
|------|------------|---------|
| Home | `/vi/` | `/en/` |
| Post | `/vi/posts/{slug}/` | `/en/posts/{slug}/` |
| Tags | `/vi/tags/{tag}/` | `/en/tags/{tag}/` |
| Series | `/vi/series/{name}/` | `/en/series/{name}/` |

### Generated manifests

| Manifest | Purpose |
|----------|---------|
| `post-index.json` | Có `lang` và `translationKey` để lọc listing/search |
| `translations.json` | Map `translationKey` → bản `vi`/`en` cho language switcher và `hreflang` |
| `tags.json` | Group theo locale để count không bị trộn |
| `series.json` | Group theo locale để thứ tự series đúng từng ngôn ngữ |

### SEO

- `<html lang="vi">` hoặc `<html lang="en">`
- Mỗi post có canonical URL theo locale hiện tại
- Nếu có bản dịch, render `rel="alternate" hreflang="vi"` và `hreflang="en"`
- Không tạo alternate link cho bản dịch chưa tồn tại

---

## Shared Layout

Tất cả trang dùng chung:

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Logo/Title + Nav + Lang + Search + Theme Toggle │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MAIN CONTENT (varies per page)                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  FOOTER: Copyright + RSS + Sitemap                  │
└─────────────────────────────────────────────────────┘
```

### Responsive

- AstroPaper responsive by default (Tailwind CSS)
- Mobile: nav collapse thành hamburger menu
- Mobile: language switcher vẫn phải hiện hoặc nằm trong menu
- Post cards stack vertically
- Tag chips wrap

### Dark/Light Mode

- Toggle trong header
- AstroPaper built-in, lưu preference vào localStorage
- Tất cả custom components (backlinks, callouts, series nav) phải support cả 2 mode
