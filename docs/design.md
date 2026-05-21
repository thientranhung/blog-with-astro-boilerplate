---
version: "alpha"
name: "my-astro-blog"
description: "Canonical design tokens and visual rationale for a light-mode-default bilingual technical blog with a designer-provided dark mode."
theme:
  default: "light"
  supported:
    - "light"
    - "dark"
colors:
  dark:
    background: "#000000"
    surface: "#0A0A0A"
    surface-dim: "#10131B"
    surface-container-lowest: "#0B0E15"
    surface-container-low: "#181B23"
    surface-container: "#1C1F27"
    surface-container-high: "#272A32"
    surface-container-highest: "#32353D"
    foreground: "#EDEDED"
    on-surface: "#E0E2ED"
    on-surface-variant: "#C1C6D7"
    muted: "#888888"
    outline: "#8B90A0"
    outline-variant: "#414754"
    border: "#1F1F1F"
    primary: "#AEC6FF"
    on-primary: "#002E6B"
    primary-container: "#0070F3"
    on-primary-container: "#FFFFFF"
    secondary: "#DBB8FF"
    on-secondary: "#470083"
    secondary-container: "#6807BA"
    tertiary: "#FFB596"
    on-tertiary: "#581E00"
    tertiary-container: "#CA4E00"
    error: "#FFB4AB"
    on-error: "#690005"
    error-container: "#93000A"
    code-surface: "#0B0E15"
    code-text: "#E0E2ED"
    callout-note-bg: "#101B2D"
    callout-note-border: "#AEC6FF"
    callout-warning-bg: "#24170F"
    callout-warning-border: "#FFB596"
    backlink-bg: "#17152A"
    backlink-border: "#DBB8FF"
  light:
    background: "#FFFFFF"
    surface: "#FAFAF7"
    surface-dim: "#F3F4EF"
    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#F6F7F2"
    surface-container: "#EEF0EA"
    surface-container-high: "#E4E7DF"
    surface-container-highest: "#D8DCD2"
    foreground: "#111827"
    on-surface: "#1F2933"
    on-surface-variant: "#4B5565"
    muted: "#667085"
    outline: "#7B8190"
    outline-variant: "#D6DAE2"
    border: "#D8D7CF"
    primary: "#0059C5"
    on-primary: "#FFFFFF"
    primary-container: "#D8E2FF"
    on-primary-container: "#001A43"
    secondary: "#6600B7"
    on-secondary: "#FFFFFF"
    secondary-container: "#EFDBFF"
    tertiary: "#7D2D00"
    on-tertiary: "#FFFFFF"
    tertiary-container: "#FFDBCD"
    error: "#B42318"
    on-error: "#FFFFFF"
    error-container: "#FFDAD6"
    code-surface: "#F1F5F9"
    code-text: "#243B53"
    callout-note-bg: "#EAF1FF"
    callout-note-border: "#0059C5"
    callout-warning-bg: "#FFF0E6"
    callout-warning-border: "#7D2D00"
    backlink-bg: "#F3E8FF"
    backlink-border: "#6600B7"
typography:
  display-lg:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: "56px"
    letterSpacing: "0"
  headline-lg:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "40px"
    letterSpacing: "0"
  headline-lg-mobile:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "0"
  body-md:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0"
  body-sm:
    fontFamily: "Geist, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0"
  label-code:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "16px"
    letterSpacing: "0"
rounded:
  sm: "0.125rem"
  default: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
spacing:
  base-unit: "4px"
  container-max: "1200px"
  article-max: "720px"
  gutter: "24px"
  margin-mobile: "16px"
  margin-desktop: "32px"
components:
  page:
    backgroundColor: "{colors.light.background}"
    textColor: "{colors.light.on-surface}"
    typography: "{typography.body-md}"
  article:
    backgroundColor: "{colors.light.surface}"
    textColor: "{colors.light.on-surface}"
    typography: "{typography.body-md}"
    width: "{spacing.article-max}"
  card:
    backgroundColor: "{colors.light.surface-container-low}"
    textColor: "{colors.light.on-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  tag-chip:
    backgroundColor: "{colors.light.surface-container}"
    textColor: "{colors.light.on-surface-variant}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  language-switcher:
    backgroundColor: "{colors.light.surface-container}"
    textColor: "{colors.light.on-surface}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  primary-link:
    textColor: "{colors.light.primary}"
    typography: "{typography.body-sm}"
  callout-note:
    backgroundColor: "{colors.light.callout-note-bg}"
    textColor: "{colors.light.on-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  callout-warning:
    backgroundColor: "{colors.light.callout-warning-bg}"
    textColor: "{colors.light.on-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  backlink-chip:
    backgroundColor: "{colors.light.backlink-bg}"
    textColor: "{colors.light.secondary}"
    rounded: "{rounded.full}"
    padding: "6px 10px"
---

# Design.md — my-astro-blog

## Overview

`my-astro-blog` is **light-mode-default** with full dark mode support. The designer handoff lives under [docs/design-system/dark-mode](docs/design-system/dark-mode), and this file is the canonical agent-readable design source for implementation.

The visual direction is technical minimalism: black base, quiet elevated surfaces, crisp borders, Geist typography, blue primary accents, purple secondary accents, and orange tertiary accents for warm emphasis. The blog should feel like a serious technical notebook with polished publishing affordances.

The designer handoff is dark mode, but the production default is light mode. The UI should reference semantic tokens, not raw hex values, so the same components can switch between `colors.light.*` and `colors.dark.*` without changing markup.

## Colors

Light mode is the default. Use `background` and `surface` for the page base, then step up through `surface-container-*` for cards, search results, tag groups, callouts, and navigation states.

Use `primary` for links, selected nav, focused controls, and the active language. Use `secondary` for backlinks and knowledge graph affordances. Use `tertiary` for warning callouts, date emphasis, and rare warm highlights.

The dark palette is the designer-provided companion theme, not a separate component system. It preserves the same semantic roles with darker surfaces and brighter text. Implementation should expose theme variables such as `--color-surface`, `--color-primary`, and `--color-border` that resolve to either light or dark token values.

## Typography

The designer direction uses Geist for UI and prose. If Geist is not installed locally, fall back to Inter and system sans-serif. Code uses JetBrains Mono.

The original designer token includes negative tracking on display/headline styles. For implementation, canonical `letterSpacing` is normalized to `0` to keep rendering stable across browsers and prevent text compression in bilingual Vietnamese/English content.

Use `display-lg` only for the homepage title or major archive headers. Use `headline-lg` for page headings and post titles. Use `body-md` for prose and UI copy. Use `body-sm` for metadata, tag counts, dates, and compact nav.

## Layout

Use a maximum page container of `1200px`, with `32px` desktop margins and `16px` mobile margins. Article prose should stay narrower, around `720px`, so long-form reading remains comfortable.

The main screens in scope are:

- Home: latest posts, technical intro, tag/series discovery.
- Post detail: metadata, language switcher, article body, callouts, backlinks, series navigation.
- Tags: tag cloud plus locale-aware filtered post list.
- Search: themed search surface with Pagefind results, filtered by current language by default.

Avoid a marketing landing page. The first screen should immediately communicate that this is a readable technical blog.

## Elevation & Depth

Depth comes from surface steps and borders, not heavy shadows. Prefer `surface-container-low` for low-emphasis cards and `surface-container-high` for focused or selected states.

Use 1px borders with `outline-variant` or `border`. Avoid nested cards. If a section already sits on an elevated surface, its internal items should use spacing and type hierarchy before adding another frame.

## Shapes

The system is intentionally sharper than typical consumer apps. Default radii are small: `0.25rem` to `0.5rem`. Use `full` only for tags, backlinks, and the language switcher.

Large rounded panels should be rare. The tone is technical, compact, and precise.

## Components

Header navigation should include Home, Posts, Tags, About, language switcher, search, and theme toggle. The language switcher must work with `translationKey`; when no translation exists, hide or disable the alternate language link.

Post cards should be dense but readable: title, date, excerpt, and tags. Cards use container surfaces and borders, not decorative shadows.

Callouts use low-contrast filled backgrounds with a stronger semantic border. Note/info callouts use primary blue; warning callouts use tertiary orange.

Backlinks should feel related to the knowledge graph. Use secondary purple treatment and chip-like links. They should not look identical to tags.

Search results should preserve language context. Vietnamese pages default to Vietnamese results, English pages default to English results.

## Do's and Don'ts

Do treat light mode as the default user-facing theme for V1.

Do implement theme colors through CSS variables or Tailwind theme tokens so dark mode can be toggled without rewriting components.

Do keep every custom component readable in both Vietnamese and English.

Do preserve the designer wireframes as reference assets, but implement against this canonical token file.

Don't hardcode raw light or dark hex values inside components.

Don't remove dark-mode support from AstroPaper; override it through semantic tokens.

Don't mix `vi` and `en` posts in default listings, tags, series, or search.

Don't use glow effects, gradient blobs, or decorative backgrounds that are not present in the technical minimalism direction.
