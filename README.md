# sharingexcess.com

Static site migrated from Webflow (export ZIP + Astro). [Bun](https://bun.com) is the package manager.

## Setup

```bash
bun install
```

## Develop

```bash
bun run dev
```

## Build and preview

```bash
bun run build
bun run preview
```

## Webflow export

Extract the Webflow code ZIP so the site lives at **`sharingexcess.webflow/`** at the repo root (same layout as Webflow’s export: `css/`, `js/`, `images/`, HTML files, etc.). If `unzip` fails on odd filenames on macOS, use:

```bash
mkdir -p sharingexcess.webflow && bsdtar -xf sharingexcess.webflow.zip -C sharingexcess.webflow
```

Sync static assets into Astro’s `public/` and regenerate pages:

```bash
rsync -a --delete sharingexcess.webflow/css sharingexcess.webflow/js sharingexcess.webflow/images sharingexcess.webflow/documents sharingexcess.webflow/videos public/
bun scripts/migration/generate-webflow-astro.ts
```
