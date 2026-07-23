# Narrative animations handoff (2026-07-23)

Status notes for continuing the Brand Exploration **Narrative** page work on `/animations`.

---

## Required agent environment

The next agent **must** have these skills available before continuing design-faithful or motion work:

1. **Figma skills** (Cursor Figma plugin / MCP)
   - Especially `figma-design-to-code` before calling `get_design_context`
   - Also `figma-use`, `get_screenshot`, `get_metadata` as needed
   - Figma MCP seat rate limits blocked deeper pulls late in this session — prefer an agent with available Figma MCP quota

2. **GSAP skills** (official GSAP Cursor skills)
   - `gsap-react` (`useGSAP`, cleanup, client-only)
   - `gsap-scrolltrigger` (pin / scrub / later scroll sections)
   - `gsap-timeline` / `gsap-core` as needed for on-load timelines

Do **not** proceed to pixel-match Figma or refine motion without those skills loaded.

---

## Figma source

| Item | Value |
|------|--------|
| File | [Brand Exploration 2026](https://www.figma.com/design/3EU1n6aLlo9AHdls66VgcD/Brand-Exploration-2026) |
| Proto | [Narrative proto](https://www.figma.com/proto/3EU1n6aLlo9AHdls66VgcD/Brand-Exploration-2026?node-id=1068-6749&starting-point-node-id=1068%3A6176&page-id=957%3A273) |
| Page | `Colors & Layouts` (`957:273`) |
| Narrative frame | `1068:6176` (proto starting point) |
| Ripple component | nested under Narrative as `Ripple-Animation` |
| Nearby scroll section (not fully implemented) | `Img-Section-Animation` (`1068:6749`) |

---

## What was added today

### Dependencies (`web/`)

- `gsap`
- `@gsap/react`
- Upgraded `@astrojs/react` from **4.x → 5.0.7** so Astro 6 / Vite 7 can hydrate React islands (`createRoot` was failing under 4.x)

### Routes / pages

- [`web/src/pages/animations.astro`](../src/pages/animations.astro) — `/animations`, uses `BaseLayout` (no site header/footer) and mounts the Narrative island with `client:load`

### Components

- [`web/src/sections/scroll/ScrollPanel.tsx`](../src/sections/scroll/ScrollPanel.tsx) — reusable pinned + scrubbed full-viewport panel
- [`web/src/sections/scroll/ScrollShowcase.tsx`](../src/sections/scroll/ScrollShowcase.tsx) — earlier generic GSAP demo panels (no longer mounted on `/animations`)
- [`web/src/sections/scroll/NarrativeShowcase.tsx`](../src/sections/scroll/NarrativeShowcase.tsx) — **current** Narrative implementation:
  - Floating pill nav matching Figma
  - Hero headline + subcopy
  - Ripple hero image block
  - Partner logo row + lemon sticker
  - **On-load** GSAP timeline for intro + ripple (not scroll-scrubbed)
  - Partners / sticker still lightly scroll-triggered

### Assets

Downloaded under [`public/images/narrative/`](../../public/images/narrative/):

- `hero-bg.jpg`, `hero-fg.jpg` (hero layers)
- Partner logos (`logo-*.png` / svg)
- Lemon sticker pieces (`sticker-*.svg`) and `logo-layer.svg` (SVG exports; must keep `.svg` extension)

Exports from Figma MCP asset URLs (those URLs expire ~7 days; prefer committed files).

### Exports

- `NarrativeShowcase` re-exported from [`web/src/sections/index.ts`](../src/sections/index.ts)

---

## Critical open issue: hero FG transparency (JPEG vs PNG)

### Symptom

Figma’s `Ripple-Animation` stacks:

1. Soft / blurred park **background** photo
2. Cutout **foreground** of people (PNG **with alpha**)
3. Expanding thin white **stroke** ripple rings centered on the handoff

With a JPEG foreground, alpha is flattened (typically to white). The park layer cannot show through, so the hero final state looks like people on a white/flat field — **not** the Figma final state.

### What we know

- The Figma MCP asset for the foreground **does** export as PNG with real transparency (sampled: many fully transparent pixels).
- Converting that asset with `sips -s format jpeg` (done earlier for size) **destroys** the cutout.
- The project currently uses **`hero-fg.jpg` on purpose** (restored per product request). PNG is preferred for correctness but deferred.

### Fix for the next agent

1. Re-fetch or re-export the foreground from Figma as **PNG with alpha** (node under `Ripple-Animation` / Img layer from design context).
2. Commit as e.g. `public/images/narrative/hero-fg.png` (resize for web if needed, **keep alpha** — do not convert to JPEG).
3. Update `NarrativeShowcase` to `src="/images/narrative/hero-fg.png"`.
4. Keep `hero-bg.jpg` (or optimize) as the blurred back layer.
5. Re-check crop: Figma uses roughly `top: -24%`, `height: 141%` on the FG and slight blur/`top: -2%` / `height: 104%` on the BG.
6. Re-validate ripple final state against the Figma prototype screenshot (thin white concentric rings on the handoff, not filled glass discs).

Until that lands, treat the hero composite as **known incorrect** vs Figma.

---

## What remains to be done

### Visual / motion fidelity (needs Figma + GSAP skills)

- [ ] Restore **PNG** foreground with alpha (above)
- [ ] Pixel-check on-load intro (headline stagger, subcopy, image reveal) against Figma prototype timing
- [ ] Pixel-check ripple: ring count, stroke weight, origin (`~53% / ~48%` is approximate), final radii/opacities
- [ ] Confirm headline treatment: design tokens had `conspectus` in SE green (`#00843D`); some prototype frames read as all kale — verify in Figma
- [ ] Nav: Figma uses placeholder “Menu Item” ×4; we used real routes — confirm intended labels/links
- [ ] Lemon sticker fonts (Malila / New Kansas swash) are approximated with Poppins

### Narrative / page scope

- [ ] Implement **`Img-Section-Animation`** (`1068:6749`) — map circle + text + cards — if it is part of the Narrative proto flow (MCP rate-limited this session)
- [ ] Pull any additional Narrative sections below the logo row if the frame has more scroll beats
- [ ] Decide whether `/animations` stays a sandbox or becomes a real marketing route

### Engineering polish

- [ ] Further compress large assets if needed (FG PNG may be multi‑MB)
- [ ] `prefers-reduced-motion`: currently skips hero motion; confirm desired final visible state
- [ ] Optionally delete or relocate `ScrollShowcase` if Narrative fully replaces the demo purpose
- [ ] Storybook story for Narrative / scroll primitives (optional)

### Verification

```sh
bun run --cwd web dev          # http://localhost:4322/animations
bun run build:web              # from repo root
```

---

## Quick file map

```
web/src/pages/animations.astro
web/src/sections/scroll/NarrativeShowcase.tsx   ← primary work surface
web/src/sections/scroll/ScrollPanel.tsx
web/src/sections/scroll/ScrollShowcase.tsx      ← unused by /animations now
public/images/narrative/*
web/docs/narrative-animations-handoff.md        ← this file
```
