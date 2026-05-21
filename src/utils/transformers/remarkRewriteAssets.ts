import type { Root } from "mdast";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";
import fs from "node:fs";
import path from "node:path";

const ASSETS_PATH = path.resolve(
  process.cwd(),
  "src/content/generated/assets.json"
);

function loadAssetMap(): Record<string, string> {
  try {
    if (!fs.existsSync(ASSETS_PATH)) return {};
    const raw = fs.readFileSync(ASSETS_PATH, "utf-8");
    const map: Record<string, string> = JSON.parse(raw);
    // Only keep entries that have a real CDN URL (non-empty string)
    return Object.fromEntries(
      Object.entries(map).filter(([, v]) => v.startsWith("http"))
    );
  } catch {
    return {};
  }
}

export function remarkRewriteAssets() {
  return (tree: Root, file: VFile) => {
    // Re-read per render so astro dev picks up sync runs without restart
    const assetMap = loadAssetMap();

    // Rewrite image nodes in markdown body
    visit(tree, "image", node => {
      const cdnUrl = assetMap[node.url];
      if (cdnUrl) {
        node.url = cdnUrl;
      }
    });

    // Rewrite frontmatter cover / ogImage via Astro's injected frontmatter
    const fm = (file.data as Record<string, unknown>)?.astro as
      | Record<string, unknown>
      | undefined;
    if (!fm?.frontmatter) return;
    const frontmatter = fm.frontmatter as Record<string, unknown>;

    for (const field of ["cover", "ogImage"] as const) {
      const val = frontmatter[field];
      if (typeof val === "string" && val.startsWith("/__assets/")) {
        const cdnUrl = assetMap[val];
        if (cdnUrl) frontmatter[field] = cdnUrl;
      }
    }
  };
}
