# Deploy Guide

Site: **blog.example.com** → Cloudflare Pages

## Workflow hàng ngày

```bash
pnpm run sync              # kéo bài từ Obsidian vault
git add .
git commit -m "content: sync posts"
git push                   # → Cloudflare Pages tự build & deploy
```

Cloudflare Pages chạy `pnpm run build` trên server của họ và deploy tự động. Không cần làm gì thêm.

---

## Setup lần đầu (một lần duy nhất)

### 1. Push code lên GitHub

```bash
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### 2. Connect Cloudflare Pages

Vào [Cloudflare Dashboard → Pages → Create a project → Connect to Git](https://dash.cloudflare.com):

- Chọn repo vừa push
- **Build settings:**
  - Framework preset: `Astro`
  - Build command: `pnpm run build`
  - Build output directory: `dist`
  - Node version: `22` (set trong Environment variables: `NODE_VERSION=22`)

### 3. Thêm Environment Variables trên Cloudflare Pages

Vào Settings → Environment Variables, thêm các biến từ `.env`:

```
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ENDPOINT
CDN_BASE_URL
```

> `VAULT_PATH` không cần — sync chạy local, không chạy trên Cloudflare.

### 4. Custom domain

Vào Pages → Custom domains → thêm `blog.example.com`.

---

## Troubleshooting

**Build fail trên Cloudflare Pages**
→ Chạy `pnpm run build` local để xem lỗi trước khi push.

**Bài mới không lên**
→ Kiểm tra đã `git add src/content/` và commit trước khi push.

**Ảnh không load**
→ Kiểm tra R2 env vars trong Cloudflare Pages settings.
