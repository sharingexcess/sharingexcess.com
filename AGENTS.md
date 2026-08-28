# AGENTS.md

## Cursor Cloud specific instructions

Monorepo-style layout: **`legacy/`** (current production site) and **`web/`** (greenfield rewrite). Bun is the sole runtime and package manager.

### Key commands

| Task | Command |
|------|---------|
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

- Production deploy builds **`legacy/`** until cutover.
- `web/` uses Tailwind v4 (`@tailwindcss/vite`) + React; `legacy/` stays on Tailwind v3 + Webflow CSS.
- Validation: `bun run build` (legacy) or `bun run build:web` (new site).
- **Clean URLs:** Astro’s default `build.format: "directory"` serves pages at clean paths (e.g. `/about`, `/find-food/colorado`). Internal links are rewritten without `.html` when running `bun run generate`. Legacy `*.html` bookmarks are 301-redirected in production by [`public/serve.json`](public/serve.json) (`serve` host config — Astro config redirects require explicit routes and cannot wildcard-match dynamic find-food paths).
- Extract legacy copy for migration: `bun scripts/rewrite/extract-fragment-content.ts about.html.body.html`
- **`sync:webflow` is disabled** — do not re-enable without removing `--delete`. Edit `public/` and `legacy/src/webflow-fragments/` directly for content changes.
- **Find food pages** (`/find-food`, state/city/profile routes) fetch partner locations at build time from the Surplus public API (`GET /public/find_food/profiles`). Profile pages use `googlePlaceId` as the URL key: `/find-food/{state}/{city}/{placeId}`. Runtime client fetches may also use `GET /public/find_food/profiles/{placeId}` (single profile) and `GET /public/find_food/places/{placeId}/details` (Google proxy). Production API: `https://api.sharingexcess.com`. Local dev (`bun run dev` / `import.meta.env.DEV`) uses `http://localhost:8080`. Override with `PUBLIC_API_SERVER_URL` or `SURPLUS_LOCAL_RUNTIME=1`.
