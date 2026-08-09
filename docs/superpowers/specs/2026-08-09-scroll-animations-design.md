# Scroll Animations — Anti Framer Studio Site

**Date:** 2026-08-09
**Status:** Approved
**Scope:** Single-page site ([app/page.tsx](../../../app/page.tsx), [app/globals.css](../../../app/globals.css)). No new dependencies.

---

## Goal

Replace the single rudimentary `.reveal` fade with a coherent, modern scroll-animation system: staggered entrances on most sections, two scroll-linked motion moments (hero parallax, drifting decorative elements, CTA pattern rotation), and a few signature editorial details (word-by-word quote reveal, animated stat counters).

## Constraints

- **No new npm dependencies.** Pure CSS + IntersectionObserver + one rAF loop.
- **No new React components.** Extend the existing `useEffect` in [app/page.tsx:45](../../../app/page.tsx#L45).
- **`prefers-reduced-motion: reduce` must fully disable every animation**, including the rAF loop. The current CSS hook at `globals.css:58` is the starting point — we extend it.
- **Mobile (<768px) parallax intensity is halved** via a CSS variable override.
- **GPU-composited transforms only.** No layout-affecting properties in animations (no `top`/`left`/`width`/`height` transitions).

## Architecture

### A. Staggered entrance system (data-attribute driven)

Replace the single `.reveal` class with a small set of variants keyed off `data-reveal` and `data-reveal-delay`. One IntersectionObserver, one `is-visible` trigger class — same pattern as today, broader reach.

| Attribute | Behavior |
|---|---|
| `data-reveal` (no value) | Fade + translateY(35px) — current behavior |
| `data-reveal="fade"` | Opacity only |
| `data-reveal="slide-left"` | From translateX(-40px) |
| `data-reveal="slide-right"` | From translateX(40px) |
| `data-reveal="scale"` | From scale(0.95) + fade |
| `data-reveal-delay="100|200|300|400|500"` | transition-delay in ms |

CSS defines the variants; the IO selector changes from `.reveal` to `[data-reveal]`.

### B. Scroll-linked motion (single rAF loop)

One `requestAnimationFrame` loop, registered in the same `useEffect`, writes two CSS custom properties to `<html>` every frame:

- `--scroll-y: <number>` — current `window.scrollY`
- `--scroll-progress: <number>` — `scrollY / (documentHeight - viewportHeight)`, clamped 0..1

Consumers are pure CSS `calc()` on top of these vars. No React state, no re-renders, no per-element scroll listeners.

**Mobile dampening:** `--parallax-strength` is `1` on desktop, `0.5` under 768px, exposed as a CSS var so consuming rules don't need media queries.

### Reduced motion

If `prefers-reduced-motion: reduce`:
- rAF loop never starts (guard in `useEffect` via `matchMedia`)
- All `[data-reveal]` elements render in their final state (CSS override)
- Counters render their final values
- Ticker animation already disabled by existing rule

## Section-by-section

### Hero (`#top`)
- **Headline** ("Ideas that / *move* / people.") — three fragments reveal with 100/200/300ms delay
- **Eyebrow + rule above headline** — fade, no delay
- **Hero visual (portrait)** — `translateY(calc(var(--scroll-y) * -0.25 * var(--parallax-strength) * 1px))`. Moves slower than the text → parallax.
- **Scanlines overlay** — `translateY(calc(var(--scroll-y) * -0.4 * var(--parallax-strength) * 1px))`. Slightly faster than image so they *appear* to drift relative to it.
- **Circle-arrow** — gentle bob driven by `--scroll-progress` (subtle, amplitude ~6px)

### Ticker
Unchanged.

### Manifesto (`#about`)
- Section label + heading + body + text-link: `data-reveal` with staggered delays 0/100/200/300
- Rocket (`.rocket`): `translateY(calc(var(--scroll-y) * 0.18 * var(--parallax-strength) * 1px)) rotate(calc(var(--scroll-y) * 0.02deg))` — drifts down + slight rotation

### Work (`#work`)
- Three `.project` cards each get `data-reveal` and `data-reveal-delay` of 0/100/200
- Project art each has subtle `transform: translateZ(0)` + hover lift (`transform: translateY(-4px)`, transition 300ms)

### Circular gallery (`.gallery-section`)
- Frame gets `data-reveal="scale"` (single reveal, 0.96→1)

### Services (`#services`)
- Heading: `data-reveal`
- `.service-item`s: `data-reveal` with `data-reveal-delay` of 0/80/160/240 (only on first entry; accordion toggles do not re-animate)

### Quote (`.quote-section`)
- `.quote-image` gets `data-reveal="slide-right"`
- `.quote-copy > *` (eyebrow, blockquote, byline, controls) get `data-reveal="slide-left"` with increasing delay
- **Blockquote itself is split into `<span className="word">`s in React on mount** (one split per quote change). Each word is an IO target with incremental `transition-delay` (index \* 30ms). On quote advance, spans reset and re-animate.

### Numbers (`.numbers`)
- Each `div` is `data-reveal`
- The `<strong>` values (17, 09) become counters: on `is-visible`, animate from 0 to target over 900ms with ease-out, updating once per frame via the same rAF loop (read `data-target` attribute). `∞` cannot count — instead it fades in while slowly rotating 360° once.
- Counter state is local to the rAF loop; no re-render.

### FAQ (`.faq`)
- Heading: `data-reveal`
- `.faq-item`s: `data-reveal` with 60ms stagger

### CTA (`#contact`)
- Section gets `data-reveal="scale"`
- Three heading lines: `data-reveal` with delays 0/120/240
- `.cta-pattern`: `transform: rotate(calc(var(--scroll-progress) * 360deg))` — full rotation across the page scroll
- `.circle-arrow.dark`: fade-in last (delay 400)

## Data flow

One effect in [app/page.tsx:45](../../../app/page.tsx#L45), after mount:

1. Create single `IntersectionObserver` watching every `[data-reveal]` and every `.word` inside the blockquote. Adds `.is-visible` on intersect.
2. If reduced motion: skip rAF, skip counter registration, and mark all `[data-reveal]` as `is-visible` immediately.
3. Otherwise, start the rAF loop:
   - Write `--scroll-y` and `--scroll-progress` on `<html>`
   - Update any visible counters (rAF-driven interpolation)
4. Cleanup on unmount: disconnect IO, cancel rAF.

**Word-by-word quote split:** when `quotes[quote][0]` changes, the component renders the new string as a sequence of `<span className="word">` children. Each span carries `style={{ transitionDelay: `${i * 30}ms` }}`. The observer picks them up on the next microtask after they mount. No manual bookkeeping.

## Error handling & edge cases

- **SSR / hydration** — effects live in `useEffect`, no browser APIs during render. Safe.
- **Reduced motion toggle mid-session** — we listen for `change` on the `prefers-reduced-motion` media query and tear down / restart accordingly. (Cheap and correct.)
- **Quote advancing rapidly** — word spans unmount/remount cleanly; IO targets are re-observed. No state leaks.
- **Page growing mid-scroll** — `--scroll-progress` recomputes every frame, so DOM growth (e.g., images loading) is naturally absorbed.
- **Accordion toggles** do not re-trigger reveal animations — `.is-visible` is sticky once set for service/faq items.

## Testing

Manual verification only (presentational change, no new logic worth unit-testing):

1. Load `/`, scroll slowly — each section animates in order
2. Scroll fast — no stuck states, no elements permanently invisible
3. `prefers-reduced-motion: reduce` in DevTools → all animations disabled, no console errors
4. Resize to <768px — parallax dampened, all reveals still fire
5. Mobile Safari + Chrome — no jank in hero parallax, counters animate
6. Lighthouse Performance — animation frames don't regress the score >5 points

## Out of scope

- Page transitions
- Scroll pinning / scrubbed timelines
- Replacing the existing ticker marquee
- Any change to the CircularGallery webgl component
