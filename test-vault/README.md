# test-vault

Sample Obsidian vault for testing the sync pipeline (Phase 2+).

## Notes

| File | published | lang | translationKey | Notes |
|------|-----------|------|---------------|-------|
| gioi-thieu-obsidian-astro.md | true | vi | intro-obsidian-astro | vi half of a translation pair; has cover image, wikilink, callout, image embed |
| intro-obsidian-astro-en.md | true | en | intro-obsidian-astro | en half of a translation pair; same translationKey |
| backlinks-va-wikilinks.md | true | vi | backlinks-wikilinks | has resolved wikilink, unresolved wikilink, warning callout, image embed |
| cloudflare-r2-image-storage.md | true | vi | — | tags: cloudflare/r2/images, warning callout |
| draft-chua-publish.md | false | vi | — | should be skipped by pipeline |

## Structure

```
test-vault/
  50-Publish/          ← VAULT_POSTS_FOLDER
    *.md               ← blog notes
  Assets/              ← images referenced from notes
```
