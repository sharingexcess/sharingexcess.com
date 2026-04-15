# AGENTS.md

## Cursor Cloud specific instructions

This is a static Astro site (sharingexcess.com) migrated from Webflow. Bun is the sole runtime and package manager — no Node.js, npm, or pnpm.

### Key commands

See `README.md` and `package.json` scripts for full reference. Quick summary:

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Dev server | `bun run dev` (port 4321) |
| Build | `bun run build` |
| Preview built site | `bun run preview` |

### Notes

- There are no lint scripts, test suites, or CI checks in this repo. Validation is done via `bun run build` (Astro static build).
- The dev server (`bun run dev`) supports HMR. Pass `--host 0.0.0.0` to expose on all interfaces if needed.
- No external services (databases, APIs, auth) are required — this is a pure static site.
- `astro check` (type checking) can take several minutes; prefer `bun run build` for quick validation.
- The `[WARN] [content] Content config not loaded` warning at dev server startup is benign and can be ignored.
