# sharingexcess.com

Static site on [Bun](https://bun.com) + Astro. The repo has two apps:

- **`legacy/`** — current Webflow-migration site (production build target)
- **`web/`** — greenfield rewrite (Astro + React + Tailwind v4)

## Setup

```bash
bun install --cwd legacy
bun install --cwd web
```

## Develop

```bash
bun run dev          # legacy site → http://localhost:4321
bun run dev:web      # new site    → http://localhost:4322
bun run storybook    # design system → http://localhost:6006
```

## Build and preview

```bash
bun run build        # production (legacy)
bun run build:web    # new site
bun run preview
```

## Content updates

**`legacy/` and `public/` are the source of truth.** Edit page content in `legacy/src/webflow-fragments/` and add assets to `public/images/`.

`sync:webflow` is **disabled** — it used `rsync --delete` and removed custom assets (logos, headshots, etc.) that are not in the Webflow export.

For a rare bulk import from Webflow Designer, extract the ZIP to **`sharingexcess.webflow/`** and run `bun run generate` (review the diff carefully; it overwrites fragments).

See [AGENTS.md](AGENTS.md) for cutover steps when the rewrite is ready.
