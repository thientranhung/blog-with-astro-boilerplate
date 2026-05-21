# ADR-001: Không dùng astro-loader-obsidian làm backbone

## Trạng thái

Accepted

## Ngày

2026-04-23

## Bối cảnh

Dự án này cần một pipeline đưa nội dung từ `Obsidian` sang `Astro` để build blog tĩnh trên `Cloudflare Workers`, với các yêu cầu đã chốt:

- chỉ publish note có `published: true`
- ưu tiên `slug` trong frontmatter, fallback từ filename
- convert `[[wikilink]]` thành internal links
- sinh `backlinks` build-time
- hỗ trợ `callout`, `tags`, và một lớp thay thế thực dụng cho `dataview`
- upload ảnh lên `Cloudflare R2`
- rewrite asset URLs theo chiến lược phù hợp với CDN/storage ngoài

Chúng ta đã nghiên cứu `astro-loader-obsidian` ở mức source code để xem có thể dùng nguyên package làm backbone cho pipeline hay không.

Nguồn tham khảo chính:

- https://github.com/aitorllj93/astro-loader-obsidian
- [external-research-obsidian-astro.md](docs/external-research-obsidian-astro.md)

## Quyết định

Không dùng `astro-loader-obsidian` làm backbone chính cho dự án.

Thay vào đó:

- dùng `custom Obsidian -> Astro sync pipeline` làm lõi
- chỉ học hỏi hoặc tái hiện các ý tưởng tốt từ `astro-loader-obsidian`
- giữ khả năng thử nghiệm package này trong một nhánh riêng nếu cần prototype nhanh

## Lý do

### 1. Dự án cần deterministic publish pipeline hơn digital garden workflow

`astro-loader-obsidian` rất hợp cho digital garden hoặc knowledge base, nơi vault có thể được publish gần như trực tiếp.

Dự án này là blog publish có kiểm soát. Chúng ta cần:

- rule publish rõ ràng
- rule slug rõ ràng
- artifact build rõ ràng để debug
- asset flow rõ ràng cho production

Nhu cầu này nghiêng về `normalize pipeline` hơn là `load vault trực tiếp`.

### 2. Cần canonical slug map do mình kiểm soát

Package này resolve document links chủ yếu dựa trên tên file/basename và matching gần đúng.

Điều đó tiện cho vault navigation, nhưng chưa đủ chặt cho blog production vì:

- có thể mơ hồ khi tên note gần giống nhau
- khó debug hơn khi link resolve không như kỳ vọng
- không phản ánh đúng rule `slug ưu tiên frontmatter`

Dự án của mình cần `canonical slug map` độc lập, tường minh, và có thể kiểm tra.

### 3. Không có chiến lược R2/CDN phù hợp với yêu cầu của dự án

`astro-loader-obsidian` xử lý local assets khá ổn:

- image embed
- relative image path
- copy một số asset sang public

Nhưng nó không giải quyết:

- upload ảnh lên `Cloudflare R2`
- đặt key ổn định cho object storage
- lưu asset manifest
- rewrite URL theo storage/CDN domain
- tái sử dụng asset mapping giữa các lần build

Đây là khoảng trống lớn so với kiến trúc đã chốt.

### 4. Backlinks của package chưa ở đúng tầng kiến trúc mà mình muốn

Package có thu thập `data.links`, nhưng `backlinks` chủ yếu được suy ra ở page/theme layer bằng cách lọc toàn bộ documents.

Trong khi đó dự án của mình cần:

- `backlinks.json`
- `unresolved-links.json`
- `tags.json`
- `assets.json`

Tức là các artifact build-time rõ ràng, không dàn logic sang UI layer.

### 5. Chưa bao phủ nhu cầu Dataview replacement và reporting

Dự án cần một lớp thay thế thực dụng cho Dataview và các báo cáo sync như:

- unresolved wikilinks
- duplicate slug
- uploaded vs reused assets
- note bị skip

`astro-loader-obsidian` không được thiết kế để làm reporting pipeline kiểu này.

### 6. Muốn giữ quyền kiểm soát cao với content contracts

Khi tự xây pipeline, ta kiểm soát được:

- schema frontmatter thật sự dùng trong dự án
- naming conventions
- warning vs hard error
- output manifests
- khả năng refactor dần mà không bị package quyết hộ kiến trúc

## Điều vẫn học từ astro-loader-obsidian

Dù không dùng làm backbone, package này vẫn rất hữu ích về mặt tham khảo.

Những phần nên học hoặc tái hiện:

- cách hook vào Astro content layer
- cách parse `[[wikilink]]` và `![[embed]]`
- cách gom `data.links` từ nội dung
- cách tách parse, render, và persist thành các bước riêng
- cách hỗ trợ broken link strategies

## Hệ quả

### Tích cực

- pipeline sát với yêu cầu thực tế của dự án
- dễ debug vì có generated manifests
- dễ mở rộng sang `R2`, `Workers`, `series`, `related posts`, `Dataview replacement`
- không bị khóa vào behavior của package bên ngoài

### Tiêu cực

- cần tự viết nhiều hơn
- mất thêm thời gian so với cắm package và chạy
- phải tự chịu trách nhiệm test cho wikilink, assets, backlinks

## Các phương án đã cân nhắc

### Phương án A: Dùng nguyên astro-loader-obsidian

Ưu điểm:

- khởi động nhanh
- có sẵn loader integration
- parse Obsidian syntax khá tốt

Nhược điểm:

- không khớp tốt với R2 pipeline
- không có generated manifests mà mình cần
- link resolution chưa đủ deterministic cho nhu cầu publish

Kết luận:

- không chọn

### Phương án B: Dùng astro-loader-obsidian rồi patch thêm

Ưu điểm:

- tận dụng được phần parse có sẵn

Nhược điểm:

- dễ rơi vào trạng thái nửa custom nửa package
- khó bảo trì hơn custom pipeline thuần
- có nguy cơ phải fight với abstraction của package

Kết luận:

- không chọn làm mặc định

### Phương án C: Custom pipeline hoàn toàn

Ưu điểm:

- khớp đúng yêu cầu
- kiểm soát toàn bộ
- dễ sinh manifests

Nhược điểm:

- công sức ban đầu cao hơn

Kết luận:

- chọn

## Kế hoạch tiếp theo

1. Init project từ `AstroPaper` theo ADR-002.
2. Rà content schema/collection convention của theme.
3. Viết `sync-obsidian-content.ts`.
4. Sinh các artifact:
   - normalized markdown
   - post index
   - backlinks
   - unresolved links
   - tags
   - assets manifest
5. Viết plugin hoặc bước transform cho:
   - wikilinks
   - asset URL rewrite
   - callouts
