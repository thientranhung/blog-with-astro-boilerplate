# Design System

This folder stores source design artifacts and implementation references for `my-astro-blog`.

## Structure

| Path | Purpose |
|------|---------|
| [../design.md](docs/design.md) | Canonical implementation-facing `DESIGN.md` tokens and rationale |
| [dark-mode/source/DESIGN.md](docs/design-system/dark-mode/source/DESIGN.md) | Raw designer-provided dark mode design system |
| [dark-mode/wireframes/home](docs/design-system/dark-mode/wireframes/home/screen.png) | Home page screenshot and HTML handoff |
| [dark-mode/wireframes/post-detail](docs/design-system/dark-mode/wireframes/post-detail/screen.png) | Post detail screenshot and HTML handoff |
| [dark-mode/wireframes/tags](docs/design-system/dark-mode/wireframes/tags/screen.png) | Tags page screenshot and HTML handoff |
| [dark-mode/wireframes/search](docs/design-system/dark-mode/wireframes/search/screen.png) | Search page screenshot and HTML handoff |
| [dark-mode/raw-designer-handoff/original-package](docs/design-system/dark-mode/raw-designer-handoff/original-package) | Original designer folder preserved for provenance |

## Implementation Rule

Use [../design.md](docs/design.md) as the source of truth for coding agents and implementation. The designer files are preserved as source references.

Light mode is the V1 default. Dark mode remains available by mapping the same semantic tokens to `colors.dark.*` values instead of hardcoding light or dark hex values in components.
