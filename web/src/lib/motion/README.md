# Motion

Shared GSAP + ScrollTrigger layer. Reveal animations are declarative: mark elements
with `data-reveal` and they animate in, staggered in DOM order, once.

Files:

| File | Role |
| --- | --- |
| [`gsap.ts`](./gsap.ts) | Registers plugins once and re-exports `gsap`, `ScrollTrigger`, `useGSAP`. Always import GSAP from here, never from `gsap` directly. |
| [`tokens.ts`](./tokens.ts) | Durations, eases, offset, stagger, scroll start position. |
| [`useSectionReveal.ts`](./useSectionReveal.ts) | The `data-reveal` hook. |
| [`CountUp.tsx`](./CountUp.tsx) | Animated number component. |

## Adding animation to a page

**1. Hydrate the island.** Animations need client JS, so the component must be
hydrated in the `.astro` page. Use `client:load` for anything above the fold
(the animation should already be running when the user arrives):

```astro
<MySection client:load />
```

For below-the-fold sections, `client:visible={{ rootMargin: "200px" }}` hydrates
early enough that the reveal isn't missed.

**2. Call the hook and attach its ref** to the section root:

```tsx
import { useSectionReveal } from "@/lib/motion";

function MySection() {
  const scope = useSectionReveal();
  return <section ref={scope}>...</section>;
}
```

`useSectionReveal()` waits for the section to scroll into view.
`useSectionReveal({ trigger: "load" })` runs immediately on mount — use it for
the first screen only.

**3. Tag the elements** that should animate in, in the order they should appear:

```tsx
<h2 data-reveal>Heading</h2>
<p data-reveal>Supporting copy</p>
<div data-reveal>Image</div>
```

Only elements inside the hook's own scope are collected, so several sections on
one page each animate independently.

## Animated numbers

```tsx
import { CountUp } from "@/lib/motion";

<CountUp value={1.2} decimals={1} suffix="M" />;
```

Counts from zero when it scrolls into view. The final value is what renders
server-side, so the correct number is in the static HTML for crawlers and for
users without JS.

## Tuning

Durations, eases, offset, stagger, and the scroll start position live in
[`tokens.ts`](./tokens.ts). Change them there rather than per component so pages
stay consistent.

## How the no-flash guard works

Static HTML paints before hydration, so reveal targets would flash visible and
then snap to hidden. To prevent that, `BaseLayout.astro` adds a `js` class to
`<html>` before paint, and `global.css` hides `[data-reveal]` only under that
class. With JS disabled — or with reduced motion — everything stays visible.

Two consequences worth knowing:

- Anything tagged `data-reveal` must live inside a hydrated island with a
  `useSectionReveal()` scope, otherwise it stays hidden.
- Users with `prefers-reduced-motion: reduce` skip all reveals and count-ups and
  see the final state immediately.

---

# Extending the system

## Changing what `data-reveal` does

The motion itself is the `gsap.fromTo()` call in
[`useSectionReveal.ts`](./useSectionReveal.ts). Editing it changes every reveal
on every page at once, which is usually what you want.

- **Feel only** (speed, easing, travel distance): edit [`tokens.ts`](./tokens.ts).
  Nothing else needs to change.
- **The animation itself** (e.g. add a slight scale or blur): edit the `fromTo`
  vars. If you add a property to the "from" state, add it to the reduced-motion
  `gsap.set()` above it too, so those users still land on the correct final state.

```ts
// reduced-motion branch must reset every property the animation touches
gsap.set(targets, { autoAlpha: 1, y: 0, scale: 1 });
```

- **When it fires**: `motion.start` in tokens controls the scroll position
  (`"top 75%"` means the animation starts when the section's top reaches 75% down
  the viewport). `once: true` is what makes reveals non-repeating — remove it and
  swap in `toggleActions` if you ever want them to replay.

If the initial hidden state changes, keep the CSS guard in `global.css` in sync.
It currently only sets `opacity: 0`; a reveal that also starts offset or scaled
will still pop into place from the wrong position before hydration unless the CSS
matches the "from" vars.

## Adding a new reveal variant

`[data-reveal]` is an attribute selector, so a differently-named attribute such
as `data-reveal-scale` is **not** picked up by the existing hook. A new variant
needs three things.

**1. Describe it** in `useSectionReveal.ts` alongside the default:

```ts
const variants = {
  "data-reveal": {
    from: { autoAlpha: 0, y: motion.offset.y },
    to: { autoAlpha: 1, y: 0 },
  },
  "data-reveal-scale": {
    from: { autoAlpha: 0, scale: 0.92 },
    to: { autoAlpha: 1, scale: 1 },
  },
} as const;
```

**2. Animate each variant** inside the same `mm.add()` handler, so one scroll
trigger drives them and reduced motion is handled once:

```ts
for (const [attr, variant] of Object.entries(variants)) {
  const targets = gsap.utils.toArray<HTMLElement>(
    root.querySelectorAll(`[${attr}]`),
  );
  if (!targets.length) continue;

  if (context.conditions?.reduce) {
    gsap.set(targets, variant.to);
    continue;
  }

  gsap.fromTo(targets, variant.from, {
    ...variant.to,
    stagger,
    delay,
    duration: motion.duration.reveal,
    ease: motion.ease.reveal,
    scrollTrigger:
      trigger === "scroll"
        ? { trigger: root, start: motion.start, once: true }
        : undefined,
  });
}
```

**3. Add the no-flash guard** for the new attribute in
`web/src/styles/global.css`, mirroring the existing rule:

```css
.js [data-reveal],
.js [data-reveal-scale] {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .js [data-reveal],
  .js [data-reveal-scale] {
    opacity: 1;
  }
}
```

Skipping step 3 causes a visible flash; adding a CSS rule without step 2 leaves
those elements invisible forever.

## One-off animations on a single page

For something specific to one page — a parallax background, a pinned section, a
hover effect — write it directly in that page's component rather than pushing it
into the shared hook. Import GSAP from [`gsap.ts`](./gsap.ts) so plugins are
registered and the singleton is shared:

```tsx
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";

function ParallaxHero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motionOk: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          if (context.conditions?.reduce) return;

          gsap.to(scope.current!.querySelector("img"), {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return <section ref={scope}>...</section>;
}
```

A one-off can share a section root with `useSectionReveal()` — both hooks create
their own scope and clean up independently. Just don't animate the same property
of the same element from two places.

Purely decorative motion that doesn't change an element's resting state (parallax,
scrub, hover) needs no CSS guard, because the element is visible either way.

## Rules that keep this working

These are the non-obvious ones. Each has already caused a bug here.

- **Always list both reduced-motion queries** in `mm.add()`. With only
  `(prefers-reduced-motion: reduce)`, the handler never runs for users who have no
  preference — which is most of them — so nothing animates and anything hidden by
  the CSS guard stays hidden.
- **Selector scoping only lasts while the context is executing.** Inside a
  `useGSAP(..., { scope })` callback, a bare string like `"[data-reveal]"` is
  scoped to that element — GSAP routes it through the active context. In code that
  runs *later* (event handlers, `setTimeout`, `await`) the context is no longer
  active and the same string silently matches the whole document. Querying from the
  scope element (`root.querySelectorAll(...)`) behaves identically in both cases,
  which is why the hook does that.
- **Return `() => mm.revert()`** from the `useGSAP` callback. `useGSAP` reverts its
  own context, but a `matchMedia` created inside it needs explicit cleanup.
- **Put `scrollTrigger` on a timeline or a top-level tween**, never on a tween
  nested inside a timeline.
- **Call `ScrollTrigger.refresh()` after layout shifts.** [`gsap.ts`](./gsap.ts)
  already does this on `window.load` for late-loading images. Anything else that
  changes page height after hydration needs its own refresh.

## Verifying a change

Animations fail silently — a broken reveal looks like missing content, not an
error. Check both motion modes before calling it done:

1. Run `bun run build:web`, then `bun run preview` from `web/`. Prefer the
   production build; the dev server has hydrated differently in the past.
2. In DevTools, use **Rendering → Emulate CSS media feature
   prefers-reduced-motion** to check `reduce`. Everything should be visible
   immediately with no animation.
3. Confirm no element is stuck hidden after scrolling the whole page:

```js
// paste in the console after scrolling to the bottom
Array.from(document.querySelectorAll("[data-reveal]")).filter(
  (el) => Number(getComputedStyle(el).opacity) < 0.99,
).length; // expect 0
```

Also confirm the real content is still in the static HTML
(`web/dist/**/*.html`) — reveal targets and `CountUp` values must render
server-side so the page works without JS.
