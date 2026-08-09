# Scroll Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single rudimentary `.reveal` fade with a coherent modern scroll-animation system: staggered entrances, two scroll-linked motion moments (hero parallax, drifting decorative elements, CTA rotation), word-by-word quote reveal, and animated stat counters.

**Architecture:** Pure CSS + IntersectionObserver + one rAF loop, all living in the existing `useEffect` in `app/page.tsx`. No new dependencies, no new React components. CSS data-attributes drive entrance variants; one scroll-progress custom property drives all scroll-linked effects via `calc()`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4 (already in the project), plain TypeScript.

**Spec:** [docs/superpowers/specs/2026-08-09-scroll-animations-design.md](../specs/2026-08-09-scroll-animations-design.md)

## Global Constraints

- **No new npm dependencies.** Pure CSS + IO + rAF.
- **No new React components.** Extend the existing client component at `app/page.tsx` and the existing stylesheet at `app/globals.css`.
- **`prefers-reduced-motion: reduce` fully disables every animation**, including the rAF loop and counter animations.
- **Mobile (<768px) parallax intensity halved** via a `--parallax-strength` CSS variable (1 desktop, 0.5 mobile).
- **GPU-composited transforms only.** No `top`/`left`/`width`/`height` transitions.

---

### Task 1: Replace `.reveal` system with data-attribute entrance variants

**Files:**
- Modify: `app/page.tsx:45-50` (useEffect), `61-80` (replace `className="reveal"` with `data-reveal`)
- Modify: `app/globals.css:55-58` (replace `.reveal` CSS with `[data-reveal]` variants)

**Interfaces:**
- Consumes: existing IntersectionObserver pattern
- Produces: `[data-reveal]`, `[data-reveal="fade|slide-left|slide-right|scale"]`, `[data-reveal-delay="0|60|80|100|120|160|200|240|300|400"]`, `.is-visible` trigger class

- [ ] **Step 1: Update the CSS foundation**

Replace lines 55–58 of `app/globals.css` (the `.reveal` block) with this:

```css
[data-reveal] { opacity:0; transition:opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1); }
[data-reveal=""], [data-reveal]:not([data-reveal="fade"]):not([data-reveal="slide-left"]):not([data-reveal="slide-right"]):not([data-reveal="scale"]) { transform:translateY(35px); }
[data-reveal="slide-left"] { transform:translateX(-40px); }
[data-reveal="slide-right"] { transform:translateX(40px); }
[data-reveal="scale"] { transform:scale(.95); }
[data-reveal].is-visible { opacity:1; transform:none; }
[data-reveal-delay="60"] { transition-delay:60ms; } [data-reveal-delay="80"] { transition-delay:80ms; }
[data-reveal-delay="100"] { transition-delay:100ms; } [data-reveal-delay="120"] { transition-delay:120ms; }
[data-reveal-delay="160"] { transition-delay:160ms; } [data-reveal-delay="200"] { transition-delay:200ms; }
[data-reveal-delay="240"] { transition-delay:240ms; } [data-reveal-delay="300"] { transition-delay:300ms; }
[data-reveal-delay="400"] { transition-delay:400ms; }
@media (prefers-reduced-motion:reduce) {
  html { scroll-behavior:auto; }
  .ticker-track { animation:none; }
  [data-reveal] { opacity:1; transform:none; transition:none; }
}
```

Note: this replaces both the old `.reveal` rule AND the existing `@media (prefers-reduced-motion)` block — consolidate them into one reduced-motion rule.

- [ ] **Step 2: Update the IntersectionObserver selector in `app/page.tsx`**

Replace `document.querySelectorAll('.reveal')` with `document.querySelectorAll('[data-reveal]')` on line 46 of `app/page.tsx`.

- [ ] **Step 3: Convert `className="reveal"` → `data-reveal` across sections**

In `app/page.tsx`, apply these exact replacements (use Edit with replace_all=false; verify each before moving on):

- Line 65: `<section id="about" className="manifesto reveal">` → `<section id="about" className="manifesto" data-reveal>`
- Line 67: `<section id="work" className="work reveal">` → `<section id="work" className="work" data-reveal>`
- Line 69: `<section className="gallery-section reveal">` → `<section className="gallery-section" data-reveal="scale">`
- Line 71: `<section id="services" className="services reveal">` → `<section id="services" className="services" data-reveal>`
- Line 73: `<section className="quote-section reveal">` → `<section className="quote-section">` (children get their own data-reveal in Task 5 — leave attribute off parent for now)
- Line 75: `<section className="numbers reveal">` → `<section className="numbers" data-reveal>`
- Line 77: `<section className="faq reveal">` → `<section className="faq" data-reveal>`
- Line 79: `<section id="contact" className="cta reveal">` → `<section id="contact" className="cta" data-reveal="scale">`

- [ ] **Step 4: Visual check**

Run `pnpm dev` and open http://localhost:3000. Scroll through the page. Expected: every section still fades up as before, gallery + CTA now scale in. No console errors.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "Refactor reveal animations to data-attribute system"
```

---

### Task 2: Add scroll-progress rAF loop with reduced-motion guard

**Files:**
- Modify: `app/page.tsx:45-50` (extend useEffect)
- Modify: `app/globals.css:9` (add `--scroll-y` and `--parallax-strength` to `:root`)

**Interfaces:**
- Produces: CSS vars `--scroll-y`, `--scroll-progress`, `--parallax-strength` on `<html>`; consumed by all scroll-linked rules in Tasks 3, 4, 6, 8

- [ ] **Step 1: Add CSS custom property defaults**

In `app/globals.css` at line 9, amend `:root` to include the vars:

```css
:root { --background:#fff; --foreground:#04040b; --border:#d3d3d3; --red:#ea0e4b; --pink:#ffdddd; --lime:#e1ef7c; --ink:#1f1d20; --muted:#5c5c5c; --scroll-y:0; --scroll-progress:0; --parallax-strength:1; }
```

Then add a mobile override at the very end of the file (after the existing `@media (prefers-reduced-motion)` block from Task 1):

```css
@media (max-width:767px) {
  :root { --parallax-strength:0.5; }
}
```

- [ ] **Step 2: Replace the existing `useEffect` with the full animation setup**

Replace lines 45–50 of `app/page.tsx` with:

```tsx
useEffect(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const els = document.querySelectorAll('[data-reveal]')

  if (reduceMotion.matches) {
    els.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
    { threshold: 0.12 }
  )
  els.forEach((el) => observer.observe(el))

  let raf = 0
  const root = document.documentElement
  const tick = () => {
    const y = window.scrollY
    const max = Math.max(1, root.scrollHeight - window.innerHeight)
    root.style.setProperty('--scroll-y', String(y))
    root.style.setProperty('--scroll-progress', String(Math.min(1, y / max)))
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => { observer.disconnect(); cancelAnimationFrame(raf) }
}, [])
```

- [ ] **Step 3: Visual check**

Reload the dev server. Scroll. Expected: nothing looks different yet (no consumers of the CSS vars), no console errors, smooth scrolling.

Test reduced motion: DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce` → reload. Expected: every section visible immediately with no fade, scroll still works.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "Add scroll-progress rAF loop with reduced-motion guard"
```

---

### Task 3: Hero parallax + staggered headline

**Files:**
- Modify: `app/page.tsx:61` (hero JSX — add data-reveal to fragments)
- Modify: `app/globals.css:25-33` (hero visual scanlines, parallax rules)

**Interfaces:**
- Consumes: `--scroll-y`, `--parallax-strength` from Task 2; `[data-reveal]` from Task 1
- Produces: nothing new

- [ ] **Step 1: Add data-reveal attributes to hero copy**

Replace the hero section in `app/page.tsx` line 61. The full replacement:

```tsx
<section id="top" className="hero">
  <div className="hero-top" data-reveal="fade"><span>Independent creative studio</span><span>Based everywhere / 2025</span></div>
  <div className="hero-copy">
    <p className="eyebrow" data-reveal data-reveal-delay="0">Hello, we're Anti Framer</p>
    <h1>
      <span data-reveal data-reveal-delay="100" style={{display:'inline-block'}}>Ideas that</span><br />
      <em data-reveal data-reveal-delay="200" style={{display:'inline-block'}}>move</em>
      <span data-reveal data-reveal-delay="300" style={{display:'inline-block'}}> people.</span>
    </h1>
    <a className="circle-arrow" href="#about" aria-label="Scroll to about" data-reveal data-reveal-delay="400">↘</a>
  </div>
  <div className="hero-visual"><div className="scanlines" /><img src={portrait} alt="Portrait on a vivid red background" /></div>
  <div className="hero-bottom" data-reveal="fade"><span>Scroll to explore</span><span className="hero-dot" /><span>Strategy / Design / Culture</span></div>
</section>
```

Note: keep the JSX on one line if it helps match existing formatting — the structure is what matters. The inline `style={{display:'inline-block'}}` is required because `transform` doesn't apply to inline elements.

- [ ] **Step 2: Append parallax rules to `app/globals.css`**

Add at the end of the file (after the mobile media query from Task 2 Step 1):

```css
.hero-visual { transform:translateY(calc(var(--scroll-y) * -0.25 * var(--parallax-strength) * 1px)); will-change:transform; }
.hero-visual .scanlines { transform:translateY(calc(var(--scroll-y) * 0.15 * var(--parallax-strength) * 1px)); will-change:transform; }
```

The hero-visual rule lives alongside the existing `.hero-visual { ... }` block (CSS later rules win for `transform`; the existing rule has no transform so there's no conflict). The scanlines offset is opposite-signed so they appear to drift against the image.

- [ ] **Step 3: Visual check**

Scroll the hero. Expected:
- On scroll down, the portrait lags behind the page (parallax)
- The scanlines appear to drift slightly against the image
- No layout shift, no overflow
- Reduced-motion: static, no parallax

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "Hero: staggered headline + parallax visual"
```

---

### Task 4: Manifesto rocket drift + work-grid stagger

**Files:**
- Modify: `app/page.tsx:65-67` (manifesto heading reveal, work project stagger)
- Modify: `app/globals.css` (append rocket drift rule, project hover lift)

**Interfaces:**
- Consumes: `[data-reveal]`, `--scroll-y`, `--parallax-strength`
- Produces: nothing new

- [ ] **Step 1: Split manifesto reveal into stages**

Replace the manifesto section in `app/page.tsx` line 65 with:

```tsx
<section id="about" className="manifesto">
  <div className="section-label" data-reveal data-reveal-delay="0">01 / A point of view</div>
  <div className="manifesto-content">
    <h2 data-reveal data-reveal-delay="100">We make brands feel <span className="highlight">alive.</span></h2>
    <p data-reveal data-reveal-delay="200">We are a creative studio for the restless, the curious, and the ones who know that the safest idea is rarely the right one. We turn a clear point of view into work people can feel.</p>
    <a className="text-link" href="#contact" data-reveal data-reveal-delay="300">More about us <span>↗</span></a>
  </div>
  <img className="rocket" src={rocket} alt="Animated rocket" />
</section>
```

(Remove the wrapping `data-reveal` on the section itself — children handle the animation.)

- [ ] **Step 2: Stagger the work-grid projects**

In `app/page.tsx` line 67, keep `data-reveal` on the section (it stays) and add it + delays to each `.project` article. Replace the three `<article>` elements with:

```tsx
<article className="project project-one" data-reveal data-reveal-delay="0">...</article>
<article className="project project-two" data-reveal data-reveal-delay="100">...</article>
<article className="project project-three" data-reveal data-reveal-delay="200">...</article>
```

(Preserve the existing inner content — only the opening tags change.)

- [ ] **Step 3: Append rocket drift + project hover CSS**

Add to `app/globals.css`:

```css
.rocket { transform:rotate(-18deg) translateY(calc(var(--scroll-y) * 0.18 * var(--parallax-strength) * 1px)) rotate(calc(var(--scroll-y) * 0.02deg)); will-change:transform; }
.project-art { transition:transform .3s cubic-bezier(.22,.61,.36,1); }
.project:hover .project-art { transform:translateY(-4px); }
```

Note: the existing `.rocket { ... }` rule sets `transform:rotate(-18deg)`. That gets *replaced* by the new rule because the new one defines `transform` more specifically (later in source). Keep both — the original provides the base rotation in reduced-motion mode where the rAF doesn't run; since `--scroll-y` stays at 0 under reduced motion or before JS runs, the calc terms evaluate to zero, leaving only the base rotation. So both rules are required for correct reduced-motion fallback.

Actually simpler: keep the existing `.rocket` rule but strip its `transform` and put it all in the new rule. Under reduced motion, `--scroll-y` is 0, so `calc(0 * 0.18 * 1 * 1px)` is 0 and only the rotation remains. Use this single rule instead:

```css
.rocket { transform:translateY(calc(var(--scroll-y) * 0.18 * var(--parallax-strength) * 1px)) rotate(calc(-18deg + var(--scroll-y) * 0.02deg)); will-change:transform; }
```

- [ ] **Step 4: Visual check**

Scroll past the manifesto. Expected: rocket drifts down-right with subtle rotation. Scroll to the work grid — cards fade up in a 0/100/200ms stagger. Hover a card — image lifts slightly.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "Manifesto + work grid: staggered reveals and rocket drift"
```

---

### Task 5: Quote section — slide reveals + word-by-word blockquote

**Files:**
- Modify: `app/page.tsx:73` (quote section JSX)
- Modify: `app/globals.css` (append word span styles + quote-direction rules)

**Interfaces:**
- Consumes: `[data-reveal]` variants from Task 1
- Produces: `.word` span class consumed by the IO from Task 2 (selector already covers it? — *no*, it doesn't; Task 2 observes `[data-reveal]` only. We add `.word` to the observation in this task.)

This is the most involved task. Read carefully.

- [ ] **Step 1: Update useEffect to also observe `.word` spans**

In `app/page.tsx`, the existing useEffect from Task 2 has this line:

```tsx
const els = document.querySelectorAll('[data-reveal]')
```

Replace it with:

```tsx
const els = document.querySelectorAll('[data-reveal], .word')
```

This change applies to both the reduced-motion shortcut (`els.forEach(el => el.classList.add('is-visible'))`) and the observer registration below it — both already loop over `els`, so no further change is needed.

- [ ] **Step 2: Split the blockquote into word spans**

In `app/page.tsx`, replace the existing `<blockquote>{quotes[quote][0]}</blockquote>` (line 73) with a small inline render:

```tsx
<blockquote key={quote}>{quotes[quote][0].split(/\s+/).map((w, i) => <span key={i} className="word" style={{ transitionDelay: `${i * 30}ms` }}>{w}{i < quotes[quote][0].split(/\s+/).length - 1 ? ' ' : ''}</span>)}</blockquote>
```

Two implementation notes:
- `key={quote}` on the blockquote forces React to unmount/remount the blockquote when the quote changes, which resets the word spans so the IO re-fires. This is the simplest way to retrigger the animation on quote advance.
- Each `.word` span is `display:inline-block` via CSS so transforms apply.

- [ ] **Step 3: Restructure the quote section JSX for slide reveals**

Replace the entire `<section className="quote-section">...</section>` in `app/page.tsx` with:

```tsx
<section className="quote-section">
  <div className="quote-image" data-reveal="slide-right"><img src={ceo} alt="Portrait of a creative leader" /></div>
  <div className="quote-copy">
    <span className="eyebrow" data-reveal="slide-left" data-reveal-delay="0">A few nice words</span>
    <blockquote key={quote}>{quotes[quote][0].split(/\s+/).map((w, i, arr) => <span key={i} className="word" style={{ transitionDelay: `${i * 30}ms` }}>{w}{i < arr.length - 1 ? ' ' : ''}</span>)}</blockquote>
    <p className="quote-by" data-reveal="slide-left" data-reveal-delay="200">{quotes[quote][1]}<br /><span>{quotes[quote][2]}</span></p>
    <div className="quote-controls" data-reveal="slide-left" data-reveal-delay="300">
      <button onClick={() => setQuote((quote + quotes.length - 1) % quotes.length)} aria-label="Previous quote">←</button>
      <span>0{quote + 1} / 0{quotes.length}</span>
      <button onClick={() => setQuote((quote + 1) % quotes.length)} aria-label="Next quote">→</button>
    </div>
  </div>
</section>
```

Important: the blockquote is intentionally NOT wrapped in `data-reveal` — its words animate individually and the observer on the parent would conflict. The eyebrow, byline, and controls each slide from the left with delays 0/200/300 (blockquote wordslide in via their own 30ms-per-word stagger).

- [ ] **Step 4: Append word-span CSS to `app/globals.css`**

```css
.quote-copy blockquote .word { display:inline-block; opacity:0; transform:translateY(10px); transition:opacity .4s ease, transform .4s ease; }
.quote-copy blockquote .word.is-visible { opacity:1; transform:none; }
```

- [ ] **Step 5: Visual check**

Scroll to the quote section. Expected:
- Image slides in from the right; eyebrow, byline, controls slide in from the left with slight delay
- Quote text fades up word-by-word as the blockquote enters the viewport
- Click "→" to advance quote — the new quote's words re-animate (because of the `key={quote}` remount)
- No console errors

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "Quote section: slide reveals + word-by-word blockquote"
```

---

### Task 6: Number counters + ∞ spin

**Files:**
- Modify: `app/page.tsx:75` (numbers JSX)
- Modify: `app/page.tsx:45-50` (useEffect — register counters with the rAF loop)
- Modify: `app/globals.css` (append infinity spin rule)

**Interfaces:**
- Consumes: rAF loop from Task 2, `data-reveal` from Task 1
- Produces: `[data-counter]` attribute with `data-target` value; counters updated by rAF

- [ ] **Step 1: Update the numbers JSX**

Replace the `<section className="numbers">` block in `app/page.tsx` line 75 with:

```tsx
<section className="numbers">
  <div className="section-label" data-reveal data-reveal-delay="0">04 / By the numbers</div>
  <div className="numbers-grid">
    <div data-reveal data-reveal-delay="0"><strong data-counter data-target="17">00</strong><span>Brands launched</span></div>
    <div data-reveal data-reveal-delay="100"><strong data-counter data-target="9">00</strong><span>Countries reached</span></div>
    <div data-reveal data-reveal-delay="200"><strong className="infinity">∞</strong><span>Curiosity levels</span></div>
  </div>
</section>
```

(Remove `data-reveal` from the wrapping `<section>` — the grid children animate individually.)

- [ ] **Step 2: Register counters in the rAF loop**

In `app/page.tsx`, locate the useEffect from Task 2. After the observer setup (before the `tick` function definition), add counter registration. The full updated effect becomes:

```tsx
useEffect(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const els = document.querySelectorAll('[data-reveal], .word')

  if (reduceMotion.matches) {
    els.forEach((el) => el.classList.add('is-visible'))
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const t = Number((el as HTMLElement).dataset.target || '0')
      el.textContent = String(t).padStart(2, '0')
    })
    return
  }

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
    { threshold: 0.12 }
  )
  els.forEach((el) => observer.observe(el))

  const counters = new Map<HTMLElement, { target: number; start: number | null }>()
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const parent = el.closest('[data-reveal]')
    if (!parent) return
    counters.set(el, { target: Number(el.dataset.target || '0'), start: null })
    const arm = new MutationObserver(() => {
      if (parent.classList.contains('is-visible')) {
        counters.get(el)!.start = performance.now()
        arm.disconnect()
      }
    })
    arm.observe(parent, { attributes: true, attributeFilter: ['class'] })
  })

  let raf = 0
  const root = document.documentElement
  const tick = (now: number) => {
    const y = window.scrollY
    const max = Math.max(1, root.scrollHeight - window.innerHeight)
    root.style.setProperty('--scroll-y', String(y))
    root.style.setProperty('--scroll-progress', String(Math.min(1, y / max)))

    counters.forEach(({ target, start }, el) => {
      if (start === null) return
      const t = Math.min(1, (now - start) / 900)
      const eased = 1 - Math.pow(1 - t, 3)
      el.textContent = String(Math.round(target * eased)).padStart(2, '0')
      if (t >= 1) counters.delete(el)
    })

    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return () => { observer.disconnect(); cancelAnimationFrame(raf) }
}, [])
```

Note: counters "arm" when their wrapping `[data-reveal]` crosses the visibility threshold — that's how we sync the count to the section's reveal without a second observer.

- [ ] **Step 3: Append infinity style to `app/globals.css`**

```css
.numbers-grid .infinity { display:inline-block; }
[data-reveal].is-visible .infinity { animation:infinite-spin 1.2s cubic-bezier(.22,.61,.36,1) 1; }
@keyframes infinite-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) {
  [data-reveal].is-visible .infinity { animation:none; }
}
```

- [ ] **Step 4: Visual check**

Scroll to the numbers section. Expected:
- Each card fades up with stagger
- The `17` rolls up from `00` over ~900ms, ending at `17`
- The `09` rolls up from `00` to `09`
- The `∞` rotates once on entry then stops
- Reduced-motion: numbers show immediately as `17`, `09`, `∞` (no animation)

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "Numbers: animated counters and infinity spin"
```

---

### Task 7: Services + FAQ list staggering

**Files:**
- Modify: `app/page.tsx:71` (services), `:77` (FAQ)
- (No CSS changes — the data-reveal system from Task 1 handles everything)

**Interfaces:**
- Consumes: `[data-reveal]`, `[data-reveal-delay]`
- Produces: nothing new

- [ ] **Step 1: Replace the services section JSX**

Replace `<section id="services" className="services" data-reveal>...</section>` with:

```tsx
<section id="services" className="services">
  <div className="section-label" data-reveal data-reveal-delay="0">03 / What we do</div>
  <div className="services-main">
    <h2 data-reveal data-reveal-delay="100">Good work<br /><span>starts with</span><br />a good question.</h2>
    <div className="service-list">
      {services.map(([num, title, body], index) => (
        <div className={`service-item ${service === index ? 'active' : ''}`} key={title} data-reveal data-reveal-delay={String(index * 80) as "0"|"80"|"160"|"240"}>
          <button onClick={() => setService(service === index ? -1 : index)}><span>{num}</span><strong>{title}</strong><b>{service === index ? '−' : '+'}</b></button>
          {service === index && <p>{body}</p>}
        </div>
      ))}
    </div>
  </div>
</section>
```

The delays land on the values 0/80/160/240 which are all defined in the CSS from Task 1.

- [ ] **Step 2: Replace the FAQ section JSX**

Replace `<section className="faq" data-reveal>...</section>` with:

```tsx
<section className="faq">
  <div className="section-label" data-reveal data-reveal-delay="0">05 / Frequently asked</div>
  <div className="faq-content">
    <h2 data-reveal data-reveal-delay="100">Questions,<br /><span>answered.</span></h2>
    <div className="faq-list">
      {faqs.map(([q, a], index) => (
        <div className="faq-item" key={q} data-reveal data-reveal-delay={String(index * 60) as "0"|"60"|"120"|"180"}>
          <button onClick={() => setFaq(faq === index ? null : index)}><span>{q}</span><b>{faq === index ? '−' : '+'}</b></button>
          {faq === index && <p>{a}</p>}
        </div>
      ))}
    </div>
  </div>
</section>
```

Note: `data-reveal-delay="180"` isn't in the original Task 1 list — add this to the CSS:

```css
[data-reveal-delay="180"] { transition-delay:180ms; }
```

(The four FAQ items land on 0/60/120/180.)

- [ ] **Step 3: Visual check**

Scroll to services — heading slides in, then four list items stagger 80ms apart. Scroll to FAQ — same behavior with 60ms. Opening an accordion does NOT reanimate (the `is-visible` class is sticky).

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "Services and FAQ: list-item stagger reveals"
```

---

### Task 8: CTA — heading line stagger + pattern rotation

**Files:**
- Modify: `app/page.tsx:79` (CTA JSX)
- Modify: `app/globals.css` (append pattern rotation rule)

**Interfaces:**
- Consumes: `--scroll-progress` from Task 2, `data-reveal="scale"` from Task 1
- Produces: nothing new

- [ ] **Step 1: Restructure the CTA JSX**

Replace `<section id="contact" className="cta" data-reveal="scale">...</section>` with:

```tsx
<section id="contact" className="cta" data-reveal="scale">
  <div className="cta-pattern" />
  <span className="eyebrow" data-reveal data-reveal-delay="0">Have a good idea?</span>
  <h2>
    <span data-reveal data-reveal-delay="0" style={{display:'inline-block'}}>Let's make</span><br />
    <em data-reveal data-reveal-delay="120" style={{display:'inline-block'}}>something</em><br />
    <span data-reveal data-reveal-delay="240" style={{display:'inline-block'}}>matter.</span>
  </h2>
  <a className="circle-arrow dark" href="mailto:hello@antiframer.studio" aria-label="Email Anti Framer" data-reveal data-reveal-delay="400">↗</a>
  <div className="cta-bottom" data-reveal="fade" data-reveal-delay="400"><span>hello@antiframer.studio</span><span>Available for 2025</span></div>
</section>
```

Note: the wrapping section keeps `data-reveal="scale"` so the whole panel scales in. The inner heading lines then stagger *on top of* that — works because both use opacity/transform transitions that compose.

- [ ] **Step 2: Append pattern rotation CSS**

```css
.cta-pattern { transform:rotate(calc(-15deg + var(--scroll-progress) * 360deg)); will-change:transform; }
```

The existing `.cta-pattern { ... }` has `transform:rotate(-15deg)`. Replace that single declaration with the new rule — the `calc()` defaults to -15deg when `--scroll-progress` is 0, so the pre-JS state matches the original design.

- [ ] **Step 3: Visual check**

Scroll from hero to CTA. Expected:
- The CTA panel scales in from 95%
- Eyebrow, three heading lines, arrow, bottom bar all stagger in
- Throughout the whole page scroll, the concentric-circle pattern slowly rotates — full 360° over the entire page
- Reduced-motion: pattern sits at -15deg, no rotation

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "CTA: staggered heading + scroll-driven pattern rotation"
```

---

### Task 9: Final verification pass

**Files:**
- (No file changes — manual QA only. If something is off, fix and re-commit under the relevant earlier task.)

- [ ] **Step 1: Full-page scroll test, normal speed**

Scroll slowly from top to bottom. Every section animates exactly once. No stuck elements. No layout shift. No flashing.

- [ ] **Step 2: Fast-scroll test**

Flick through the whole page quickly with the scrollbar. Every section should still reveal (because IO is intersection-based, not velocity-based). No permanently hidden content.

- [ ] **Step 3: Reduced-motion test**

DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → reload. Expected:
- All sections visible immediately
- No parallax
- Counters display final values
- Ticker is static (already covered by existing rule)
- ∞ is static
- CTA pattern is static

- [ ] **Step 4: Mobile viewport test**

DevTools → 375px width. Reload. Expected:
- Hero parallax visibly less aggressive (`--parallax-strength:0.5`)
- All data-reveals fire correctly
- Mobile menu opens/closes without leftover animation state

- [ ] **Step 5: Console + performance check**

- No errors in DevTools Console
- Performance tab → record 5 seconds of scrolling → no long tasks >50ms attributed to `scroll` or `requestAnimationFrame` handlers
- Lighthouse Performance score — note current value, compare to original (acceptable drop <5 points)

- [ ] **Step 6: Revert verification in source**

`git status` should show no uncommitted changes. `git log` should show 8 commits — one per task — plus the spec commit. If anything is missing, return to the relevant task.

---

## Self-Review Notes

(Performed before saving — issues fixed inline.)

- **Spec coverage:** Walked the spec section by section. Every subsection maps to at least one task: stagger variants → T1, rAF loop → T2, hero → T3, manifesto + work → T4, quote → T5, numbers → T6, services/FAQ → T7, CTA → T8, mobile d/RM → T2+T9.
- **Placeholder scan:** No "TBD", "add appropriate handling", or "similar to Task N" references.
- **Type consistency:** `data-reveal-delay` values (0/60/80/100/120/160/180/200/240/300/400) are used consistently across tasks. Task 7 adds `180` because FAQ needs it.
- **Spec deviation:** None.
