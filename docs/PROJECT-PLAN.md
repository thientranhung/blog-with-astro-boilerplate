# Project Plan — my-astro-blog

> Obsidian → Astro content sync pipeline + blog SSG trên Cloudflare
>
> **Tạo:** 2026-05-18 · **Cập nhật lần cuối:** 2026-05-18
> **Trạng thái:** Phase 0 Done → Phase 1 Ready to Start

---

## Tổng quan

Dự án này xây dựng blog cá nhân với Astro (SSG), nội dung từ Obsidian vault, deploy trên Cloudflare Workers + Static Assets, ảnh lưu trên Cloudflare R2.

Trọng tâm kỹ thuật không nằm ở Astro hay Cloudflare, mà nằm ở **content sync pipeline** giữa Obsidian và Astro.

### Tài liệu liên quan

- [project-architecture.md](project-architecture.md) — Kiến trúc tổng thể
- [content-pipeline-spec.md](content-pipeline-spec.md) — Contract chi tiết cho pipeline
- [ADR-001](decisions/adr-001-obsidian-content-pipeline-decision.md) — Không dùng astro-loader-obsidian
- [ADR-002](decisions/adr-002-use-astropaper-as-base-theme.md) — Dùng AstroPaper làm base theme
- Handoff trong Obsidian: `20-Workspace/Projects/my-astro-blog/HANDOFF-2026-04-24-astro-blog-architecture.md`

### Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Astro v6 (SSG) |
| Base Theme | AstroPaper v6 |
| Content Source | Obsidian Vault |
| Pipeline | Custom TypeScript sync script |
| Hosting | Cloudflare Workers + Static Assets |
| Image Storage | Cloudflare R2 |
| Markdown Transform | Remark + Rehype plugins |
| Languages | Vietnamese (`vi`) + English (`en`) |
| Visual Direction | Light-mode default technical minimalism, dark mode supported via semantic tokens |

---

## Epics & Stories

### Quy ước trạng thái

- `[ ]` — Chưa bắt đầu
- `[~]` — Đang làm
- `[x]` — Xong
- `[!]` — Blocked

### Quy ước ưu tiên

- **P0** — Blocker, phải xong trước khi phase tiếp theo bắt đầu
- **P1** — Quan trọng, nên làm trong phase
- **P2** — Nice-to-have, có thể dời sang phase sau

---

## Phase 0: Architecture & Research `[x] DONE`

> Đã hoàn tất 2026-04-24. Xem handoff để biết chi tiết.

- [x] Thiết kế architecture docs
- [x] Viết content pipeline spec
- [x] Research Obsidian → Astro ecosystem
- [x] Đọc source astro-loader-obsidian, viết ADR-001
- [x] Chọn AstroPaper, viết ADR-002
- [x] Rà soát và dọn gọn docs

---

## Phase 1: Project Scaffold & Theme Setup

> **Mục tiêu:** Có Astro project chạy được local với AstroPaper theme, content schema đã remap theo pipeline spec.

### Epic 1.1: Init Project từ AstroPaper `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 1.1.1 | Init AstroPaper | Scaffold project từ template `satnaing/astro-paper`, cài dependencies bằng `pnpm` | `pnpm dev` chạy được, trang hiển thị đúng AstroPaper default | — |
| 1.1.2 | Init Git repo | `git init`, tạo `.gitignore` phù hợp, commit initial | Có git history, `.gitignore` exclude `node_modules`, `dist`, `.env`, `src/content/posts/*`, `src/content/generated/*` | 1.1.1 |
| 1.1.3 | Customize site config | Sửa `astro-paper.config.ts`: title, author, URL, socials, timezone cho blog cá nhân | Config phản ánh thông tin blog thật, không còn default AstroPaper | 1.1.1 |
| 1.1.4 | Dọn sample content | Xóa blog posts mẫu của AstroPaper trong `src/content/posts/`, giữ lại `about.md` làm template | Không còn bài mẫu, build vẫn pass | 1.1.1 |
| 1.1.5 | Setup theme foundation | Tạo theme foundation đọc theo `docs/design.md`: light mode default, dark mode dùng cùng semantic token names | Có global CSS variables cho `light` và `dark`. Default load là light. Theme toggle đổi được light/dark. Build pass | 1.1.3 |

### Epic 1.1b: Design System Implementation Contract `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 1.1b.1 | Token mapping audit | Audit `docs/design.md` và designer handoff trong `docs/design-system/dark-mode/`, map token sang AstroPaper/Tailwind/CSS variables | Có bảng mapping: design token → CSS variable/Tailwind token → component usage. Không có token chính bị bỏ quên | 1.1.5 |
| 1.1b.2 | Semantic CSS variables | Implement biến semantic: `--color-background`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-primary`, `--color-secondary`, `--color-tertiary`, `--radius-*`, `--space-*` | Components dùng semantic variables, không hardcode raw hex trừ file theme token source | 1.1b.1 |
| 1.1b.3 | Default theme behavior | Cấu hình theme default là `light`, vẫn respect stored user preference sau lần toggle đầu tiên | First visit hiển thị light mode. Toggle dark lưu preference. Clear localStorage quay lại light default | 1.1b.2 |
| 1.1b.4 | Light mode derivation review | Vì designer handoff là dark-only, review light tokens trong `docs/design.md` trước khi implement rộng | Light palette đủ contrast cho text, links, cards, callouts, backlinks, code blocks. Nếu màu nào yếu thì chỉnh token trước khi code component | 1.1b.1 |

### Epic 1.2: Remap Content Schema `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 1.2.1 | Audit AstroPaper schema | Đọc `src/content.config.ts`, map từng field với pipeline spec schema | Có bảng mapping rõ ràng giữa AstroPaper schema ↔ Obsidian frontmatter schema | 1.1.1 |
| 1.2.2 | Extend content schema | Thêm fields mới vào `content.config.ts`: `series`, `excerpt`, `sourcePath`, `lang`, `translationKey`. Đổi `pubDatetime`/`modDatetime` thành format tương thích với `created`/`updated` từ Obsidian | Schema validate đúng với frontmatter mẫu từ pipeline spec. Astro build pass | 1.2.1 |
| 1.2.3 | Tạo generated content structure | Tạo `src/content/generated/` với placeholder JSON files: `post-index.json`, `backlinks.json`, `unresolved-links.json`, `tags.json`, `series.json`, `translations.json`, `assets.json` | Files tồn tại, có schema comment. Astro có thể import | 1.2.2 |

### Epic 1.3: Local Dev Workflow `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 1.3.1 | Thêm npm scripts | Thêm `pnpm run sync` script vào `package.json` (placeholder chạy `scripts/sync-obsidian-content.ts`). Đảm bảo flow: `sync` → `dev` / `build` | `pnpm run sync` chạy được (dù chưa làm gì). `pnpm dev` và `pnpm build` pass | 1.2.3 |
| 1.3.2 | Setup .env.example | Tạo `.env.example` với các biến cần thiết: `VAULT_PATH`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CDN_BASE_URL` | File tồn tại, có comment giải thích từng biến | 1.1.1 |
| 1.3.3 | Viết sample Obsidian notes | Tạo `test-vault/` với 3-5 note mẫu cover: `published: true/false`, wikilinks, callout, tags, image embed, series, `lang`, `translationKey` | Vault mẫu đủ để test mọi feature của pipeline, gồm 1 cặp bài Việt/Anh cùng logical article | — |

**Milestone Phase 1:** Astro project chạy local, schema tương thích, light-default/dark-toggle theme foundation hoạt động, có test vault sẵn sàng cho Phase 2.

---

## Phase 2: Content Sync Pipeline

> **Mục tiêu:** Có sync script hoạt động: đọc vault → filter → normalize → resolve links → output markdown + manifests.

### Epic 2.1: Pipeline Core `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 2.1.1 | Scan & filter published notes | Đọc tất cả `.md` trong vault path, parse frontmatter, chỉ giữ notes có `published: true` | Đúng số notes published. Notes thiếu frontmatter hoặc `published: false` bị skip | 1.3.1 |
| 2.1.2 | Frontmatter normalize | Map frontmatter Obsidian → AstroPaper schema. Validate required fields (`title`, `published`, `lang`). Normalize `tags` thành `string[]`, dates thành ISO. Default `lang: vi` nếu chưa khai báo trong giai đoạn migration | Output frontmatter match schema. Thiếu `title` → hard error. `lang` ngoài `vi/en` → hard error. Extra fields → warning | 2.1.1 |
| 2.1.3 | Slug resolution | Resolve slug: ưu tiên `frontmatter.slug`, fallback slugify filename. Check trùng slug theo cặp `lang + slug` | Slug unique trong từng ngôn ngữ. Trùng `lang + slug` → pipeline abort với error message rõ ràng | 2.1.2 |
| 2.1.4 | Write normalized markdown | Ghi file output vào `src/content/posts/{lang}/{slug}.md` với frontmatter đã normalize | Files đúng vị trí, frontmatter valid, body markdown giữ nguyên (chưa transform links) | 2.1.3 |
| 2.1.5 | Pipeline report | In summary sau mỗi lần sync: notes scanned, published, skipped, errors, warnings | Report hiển thị đầy đủ số liệu theo format trong spec section 14 | 2.1.4 |
| 2.1.6 | Translation grouping | Gom các posts có cùng `translationKey`, sinh map bản dịch giữa `vi` và `en` | Mỗi logical article có thể có 1 hoặc 2 ngôn ngữ. Thiếu bản dịch → warning, không abort. Trùng `translationKey + lang` → hard error | 2.1.3 |

### Epic 2.2: Wikilink Resolution `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 2.2.1 | Parse wikilinks | Regex/parser tìm `[[target]]`, `[[target\|label]]`, `[[Folder/target]]` trong markdown body | Tìm đúng tất cả wikilinks, kể cả trong lists, blockquotes. Không match trong code blocks | 2.1.3 |
| 2.2.2 | Build slug map | Tạo map theo ngôn ngữ: `lang + note basename → slug`, `lang + note title → slug` từ tập published notes | Map đầy đủ, hỗ trợ resolve theo basename lẫn title, ưu tiên target cùng `lang` với bài hiện tại | 2.1.3 |
| 2.2.3 | Resolve wikilinks → internal links | Thay `[[target]]` → `[target](/vi/posts/slug/)` hoặc `[target](/en/posts/slug/)` nếu target tồn tại. `[[target\|label]]` → `[label](...)`. Không tạo link hỏng nếu target không resolve được | Links đúng URL theo ngôn ngữ hiện tại. Unresolved → giữ plain text + ghi warning | 2.2.1, 2.2.2 |
| 2.2.4 | Track outbound & unresolved links | Mỗi post ghi `outboundLinks[]` và `unresolvedLinks[]` | Metadata đúng. `unresolved-links.json` chứa tất cả links không resolve được | 2.2.3 |

### Epic 2.3: Backlinks `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 2.3.1 | Build link graph | Thu thập outbound links từ tất cả published posts → tạo directed graph | Graph chính xác, chỉ chứa resolved links | 2.2.4 |
| 2.3.2 | Generate backlinks manifest | Đảo graph → sinh `backlinks.json` với format `{ slug: [{ slug, title }] }` | Backlinks đúng. Post A link Post B → Post B có backlink từ Post A | 2.3.1 |

### Epic 2.4: Tags & Series Manifests `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 2.4.1 | Generate tags.json | Collect tags từ tất cả published posts theo ngôn ngữ → `{ vi: { tag: [slug1] }, en: { tag: [slug2] } }` | Tags đầy đủ, sorted theo từng locale. Tags rỗng → warning | 2.1.4 |
| 2.4.2 | Generate series.json | Collect series theo ngôn ngữ → `{ vi: { series-name: [slug1] }, en: { series-name: [slug2] } }` theo thứ tự `created` | Series đúng thứ tự trong từng locale. Posts không có series → không xuất hiện | 2.1.4 |
| 2.4.3 | Generate post-index.json | Metadata chính của tất cả posts: slug, title, description, tags, created, updated, lang, translationKey, outboundLinks | Index đầy đủ, dùng được cho listing, search, related posts, lọc theo ngôn ngữ | 2.2.4 |
| 2.4.4 | Generate translations.json | Output `{ translationKey: { vi?: slug, en?: slug } }` và metadata title/lang cho language switcher | Bài có bản dịch hiển thị được switcher. Bài chưa có bản dịch không tạo link hỏng | 2.1.6 |

### Epic 2.5: Callout Support `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 2.5.1 | Integrate rehype-callouts | Cài `rehype-callouts` vào Astro config, test với Obsidian callout syntax | `> [!note]`, `> [!warning]`, `> [!tip]` render đúng HTML/CSS | 1.1.1 |
| 2.5.2 | Style callouts | Thêm CSS cho callout types phổ biến theo `docs/design.md`, tương thích light/dark mode của AstroPaper | Callouts hiển thị đúng light default và dark mode token fallback | 2.5.1 |

### Epic 2.6: Image Embed Parse `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 2.6.1 | Parse image references | Tìm `![[image.png]]`, `![](./image.png)`, `![](/Assets/image.png)`, frontmatter `cover` | Tất cả image refs được thu thập vào `assetRefs[]` | 2.1.1 |
| 2.6.2 | Resolve image paths | Map image ref → absolute path trong vault. Handle tên trùng, subfolder | Paths chính xác. Image không tìm thấy → warning (hoặc hard error nếu là `cover` của published post) | 2.6.1 |
| 2.6.3 | Rewrite image syntax | `![[image.png]]` → `![image](/__assets/image.png)` (logical path). Markdown images giữ logical path | Normalized markdown dùng logical path thống nhất. Không hardcode CDN URL | 2.6.2 |

**Milestone Phase 2:** `pnpm run sync` đọc vault, output markdown + JSON manifests. Wikilinks resolved, backlinks generated. `pnpm dev` hiển thị posts đúng.

---

## Phase 3: R2 Image Upload & URL Rewrite

> **Mục tiêu:** Images từ vault upload lên R2, Astro build rewrite logical paths → CDN URLs.

### Epic 3.1: R2 Upload Pipeline `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 3.1.1 | R2 client setup | Tạo `src/lib/cloudflare/r2-client.ts` sử dụng S3-compatible API. Config từ `.env` | Client connect được R2 bucket, list objects thành công | 1.3.2 |
| 3.1.2 | Content-hash asset key | Implement naming: `images/<content-hash>-<safe-filename>.ext`. Hash = first 12 chars SHA-256 of file content | Key ổn định: đổi tên file local → key không đổi nếu content giữ nguyên. Key unique | 3.1.1 |
| 3.1.3 | Upload with dedup | So sánh asset manifest cũ (`assets.json`) với refs hiện tại. Chỉ upload file mới hoặc thay đổi | Upload count đúng. Reused assets không bị re-upload. Report hiển thị new vs reused | 3.1.2 |
| 3.1.4 | Generate assets.json | Output `{ "source-path": "https://cdn.example.com/images/abc123-photo.jpg" }` | Mapping đầy đủ. Astro build có thể đọc để rewrite URLs | 3.1.3 |

### Epic 3.2: Remark Plugin — Asset URL Rewrite `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 3.2.1 | Viết remark-rewrite-assets | Remark plugin đọc `assets.json`, rewrite logical paths → CDN URLs trong markdown AST | `![](/__assets/photo.jpg)` → `![](https://cdn.example.com/images/abc123-photo.jpg)` | 3.1.4 |
| 3.2.2 | Tích hợp vào astro.config | Thêm plugin vào `markdown.remarkPlugins` trong Astro config | Build pass. Images trong rendered HTML trỏ đúng CDN URL | 3.2.1 |
| 3.2.3 | Cover image rewrite | Frontmatter `cover` (ogImage) cũng được rewrite qua assets.json | OG image URL đúng CDN path | 3.2.1 |

### Epic 3.3: Responsive Images `P2`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 3.3.1 | Rehype plugin responsive images | `<img>` → `<picture>` với `loading="lazy"`, `decoding="async"`, `srcset`/`sizes` nếu R2 hỗ trợ transform | Images có lazy loading và proper attributes | 3.2.2 |

**Milestone Phase 3:** Images upload R2, URLs rewrite tự động. Build production có ảnh từ CDN.

---

## Phase 4: Polish, Dataview Replacement & Deploy

> **Mục tiêu:** Blog production-ready: static manifests thay dataview, search, deploy lên Cloudflare.

### Epic 4.1: Dataview Replacement `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 4.1.1 | Latest posts component | Astro component đọc `post-index.json`, render N bài mới nhất | Trang chủ hiển thị latest posts đúng thứ tự | Phase 2 done |
| 4.1.2 | Posts by series component | Component đọc `series.json`, render posts trong cùng series | Series page hiển thị đúng thứ tự | Phase 2 done |
| 4.1.3 | Related posts component | Dựa trên shared tags + backlinks, suggest related posts | Mỗi post hiển thị 3-5 related posts hợp lý | Phase 2 done |

### Epic 4.2: Backlinks UI `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 4.2.1 | Backlinks component | Astro component đọc `backlinks.json`, render list ở cuối mỗi post | Hiển thị đúng incoming links. Không hiện nếu không có backlinks | Phase 2 done |
| 4.2.2 | Style backlinks | CSS phù hợp dark/light mode, không chiếm quá nhiều space | Đẹp, subtle, responsive | 4.2.1 |

### Epic 4.3: Deploy Cloudflare `P0`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 4.3.1 | Setup wrangler | Cài `wrangler`, tạo `wrangler.toml` cho Workers + Static Assets | `wrangler deploy` thành công | Phase 1 done |
| 4.3.2 | CI/CD pipeline | GitHub Actions: sync → build → deploy. Hoặc manual deploy flow | Push to main → auto deploy (hoặc 1-command manual deploy) | 4.3.1 |
| 4.3.3 | Custom domain | Bind domain vào Cloudflare Worker | Blog accessible qua custom domain | 4.3.2 |

### Epic 4.4: SEO & Feeds `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 4.4.1 | Verify RSS | Đảm bảo RSS feed hoạt động với content mới | Feed valid, chứa published posts | Phase 2 done |
| 4.4.2 | Verify sitemap | Sitemap bao gồm tất cả published posts và tag pages | XML valid, URLs đúng | Phase 2 done |
| 4.4.3 | OG images | Dynamic OG images (AstroPaper built-in) hoạt động với schema mới | Share link hiển thị OG image đúng | Phase 3 done |
| 4.4.4 | Multilingual SEO | Thêm `html lang`, canonical URL, `hreflang` alternate links cho `vi`/`en`, và optional language-specific RSS feeds | Mỗi bài song ngữ có alternate link đúng. Bài chỉ có một ngôn ngữ không tạo alternate hỏng | Phase 2 done |

### Epic 4.5: Multilingual UX `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 4.5.1 | Language switcher | Thêm switcher `VI/EN` ở header và post detail, đọc từ `translations.json` | Đang ở bài Việt có thể chuyển sang bản Anh nếu tồn tại, và ngược lại. Nếu không có bản dịch thì disabled/hidden rõ ràng | 2.4.4 |
| 4.5.2 | Locale-aware listing pages | Home, Posts, Tags, Series lọc theo ngôn ngữ hiện tại | `/vi/...` chỉ hiện bài Việt, `/en/...` chỉ hiện bài Anh. Counts của tags/series đúng theo locale | 2.4.3 |
| 4.5.3 | Locale-aware search | Pagefind index hoặc UI search hỗ trợ lọc theo `lang` | Người đọc đang ở `vi` không bị lẫn kết quả tiếng Anh, trừ khi chọn all languages | 2.4.3 |

### Epic 4.6: Visual QA `P1`

| # | Story | Mô tả | Acceptance Criteria | Dependencies |
|---|-------|-------|---------------------|--------------|
| 4.6.1 | Match dark mode wireframes | So sánh Home, Post Detail, Tags, Search với screenshots trong `docs/design-system/dark-mode/wireframes/` | Layout, typography, spacing, color roles khớp đủ gần với designer handoff. Không có overlap ở desktop/mobile | 1.1.5 |
| 4.6.2 | Verify dark mode toggle | Kiểm tra theme toggle sang dark mode sau khi áp dụng light-mode default design | Dark mode bám designer handoff, contrast đạt mức hợp lý, custom components không hardcode màu theo một theme | 1.1.5 |
| 4.6.3 | Verify light mode default screens | Chụp Home, Post Detail, Tags, Search ở light mode desktop/mobile | First-load light mode đúng token, không lệch layout so với dark reference, text đủ contrast, không có component còn màu dark hardcoded | 1.1b.3 |
| 4.6.4 | Theme regression checks | Thêm checklist hoặc Playwright smoke test cho theme toggle trên các trang chính | Toggle không gây layout shift lớn, không mất trạng thái language route, không tạo flash theme sai kéo dài | 1.1b.3 |

**Milestone Phase 4:** Blog live trên Cloudflare, có search, related posts, backlinks UI, SEO hoàn chỉnh.

---

## Dependency Graph

```
Phase 0 (DONE)
    │
    ▼
Phase 1: Scaffold ──────────────────────┐
    │                                    │
    ▼                                    ▼
Phase 2: Sync Pipeline              Epic 2.5: Callouts (independent)
    │
    ├──► Phase 3: R2 Images (needs asset refs from Phase 2)
    │
    └──► Phase 4: Polish & Deploy (needs manifests from Phase 2)
              │
              └──► Epic 4.3: Deploy (can start after Phase 1, parallel with Phase 2/3)
```

---

## Hard Errors (Pipeline phải abort)

Theo spec section 15:

1. Trùng `lang + slug` giữa 2+ published notes
2. Published note thiếu `title`
3. File markdown không parse được
4. `cover` declared nhưng file không resolve được (published notes only)
5. `lang` không thuộc whitelist `vi`, `en`
6. Trùng `translationKey + lang`

## Warnings (Log, tiếp tục)

Theo spec section 16:

1. Wikilink không resolve được
2. Asset không dùng tới
3. Tag rỗng hoặc trùng
4. Frontmatter field ngoài schema

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Wikilink resolution ambiguity (filename vs alias vs path) | Links sai hoặc thiếu | Resolve theo thứ tự: slug → basename → title. Log khi có ambiguity |
| AstroPaper schema breaking changes khi update | Build fail | Pin AstroPaper version. Test upgrade trên branch riêng |
| R2 upload slow với vault lớn | Sync chậm | Content-hash dedup + incremental upload từ `assets.json` |
| Dataview scope creep | Pipeline phình | V1 chỉ hỗ trợ patterns đã list. Từ chối feature ngoài scope |
| Local vs production URL divergence | Render khác nhau | Cả 2 env đi qua cùng remark plugin rewrite flow |
| Multilingual URL/schema drift | Bản Việt/Anh link sai, SEO duplicate content | Dùng `translationKey` làm logical article id, URL theo locale, sinh `hreflang` từ `translations.json` |
| Theme colors hardcoded into components | Sau này khó đổi theme hoặc theme toggle vỡ | Implement qua semantic CSS variables từ `docs/design.md`, không dùng raw hex trực tiếp trong component |
| Light palette is derived, not designer-provided | Light mode có thể kém polish hơn dark handoff | Review contrast/token trước Phase 1 implementation và chạy visual QA riêng cho light default |
| Theme flash on first load | First visit thấy dark/light nháy sai, UX thiếu polish | Set default light at document bootstrap, apply stored preference trước khi render visible UI |

---

## Cleanup Note

> **2026-05-18:** Một số files AstroPaper đã bị copy vào project folder do nhầm lẫn (scaffold trước khi có plan). Cần dọn trước khi bắt đầu Phase 1:
>
> ```bash
> cd .
> # Xóa tất cả files AstroPaper, giữ docs/, .squad/, CLAUDE.md
> rm -rf .dockerignore .github .prettierignore .prettierrc .vscode \
>   AstroPaper-lighthouse-score.svg CHANGELOG.md Dockerfile LICENSE README.md \
>   astro-paper.config.ts astro.config.ts cz.yaml docker-compose.yml \
>   eslint.config.js package.json pnpm-lock.yaml public src tsconfig.json
> ```
