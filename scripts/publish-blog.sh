#!/usr/bin/env bash
# publish-blog.sh
#
# Sync Obsidian vault → git commit → git push → Cloudflare Pages auto-deploys.
#
# Usage:
#   pnpm run deploy
#   bash scripts/publish-blog.sh

set -euo pipefail

cd "$(dirname "$0")/.."

# ── Guard: must be on main ────────────────────────────────────────────────────
current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "main" ]]; then
  echo "[publish] ✘ Must be on 'main' branch (currently on '$current_branch')."
  echo "[publish]   Switch with: git checkout main"
  exit 1
fi

# ── Sync Obsidian → src/content/ ─────────────────────────────────────────────
echo "[publish] Syncing Obsidian vault…"
pnpm run sync

# ── Stage content changes only ────────────────────────────────────────────────
git add -A src/content/posts src/content/generated

if git diff --cached --quiet; then
  echo "[publish] No content changes — nothing to publish."
  exit 0
fi

# ── Commit & push ─────────────────────────────────────────────────────────────
commit_date="$(date '+%Y-%m-%d %H:%M')"
git commit -m "content: publish blog posts ${commit_date}"

echo "[publish] Pushing to GitHub…"
git push

echo "[publish] ✔ Done. Cloudflare Pages will build and deploy automatically."
echo "[publish]   Monitor: https://dash.cloudflare.com → Pages → my-astra-blog"
