# AGENTS.md

## Cursor Cloud specific instructions

Monorepo-style layout: **`legacy/`** (current production site) and **`web/`** (greenfield rewrite). Bun is the sole runtime and package manager.

### Key commands

| Task | Command |
|------|---------|
| Install all deps | `bun run setup` |
| Install legacy deps | `bun install --cwd legacy` |
| Install web deps | `bun install --cwd web` |
| Dev (legacy — production target) | `bun run dev` (port 4321) |
| Dev (new site) | `bun run dev:web` (port 4322) |
| Design system (Storybook) | `bun run storybook` (port 6006) |
| Build production | `bun run build` → builds `legacy/` |
| Build new site | `bun run build:web` |
| Preview built site | `bun run preview` |

### Cutover (when migration is complete)

1. Change root `package.json` `"build"` to `bun run --cwd web build`
2. Update `Dockerfile` to `cd web && bun run build` and `COPY web/dist`
3. Smoke-test all URLs in `scripts/migration/output/urls.json`
4. Delete `legacy/`, `sharingexcess.webflow/`, and legacy CSS in `public/css/`

### Notes

- **Storybook copy:** When converting Figma components, keep the design's Lorem Ipsum placeholder text in `*.stories.tsx`. Do not substitute AI-generated marketing copy or invented stats — real copy goes in Astro pages only.
- Production deploy builds **`legacy/`** until cutover.
- `web/` uses Tailwind v4 (`@tailwindcss/vite`) + React; `legacy/` stays on Tailwind v3 + Webflow CSS.
- Validation: `bun run build` (legacy) or `bun run build:web` (new site).
- Extract legacy copy for migration: `bun scripts/rewrite/extract-fragment-content.ts about.html.body.html`
