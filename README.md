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

## Webflow export

Extract the Webflow code ZIP to **`sharingexcess.webflow/`** at the repo root, then:

```bash
bun run sync:webflow
bun run generate
```

See [AGENTS.md](AGENTS.md) for cutover steps when the rewrite is ready.
