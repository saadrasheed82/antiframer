# AI Creative Agency Rebrand — Copy Spec

**Date:** 2026-08-09
**Project:** Rebrand "Anti Framer" from a generic creative studio to an AI-native creative studio.
**Scope:** Copy only. No visual, structural, component, or imagery changes. Brand name "Anti Framer®" stays.

## Constraints

- All imagery, sections, animations, layout, and styles remain unchanged.
- Edit only `app/page.tsx` (strings) and `app/layout.tsx` (metadata).
- Voice stays editorial, confident, a little restless — same as current copy, now pointed at AI.
- Keep email as `hello@antiframer.studio` (don't introduce an unowned domain).
- Keep "MAKE IT MATTER" ticker as-is.

## Copy map (before → after)

### Hero
- Top meta `Independent creative studio` → `Independent AI creative studio`
- Top meta `Based everywhere / 2025` → unchanged
- Eyebrow `Hello, we’re Anti Framer` → unchanged
- H1 `Ideas that / move / people.` → `Ideas that / out-think / machines.`
- Bottom meta `Strategy / Design / Culture` → `Strategy / AI / Craft`
- Bottom `Scroll to explore` → unchanged

### Manifesto
- Section label `01 / A point of view` → unchanged
- H2 `We make brands feel alive.` → `We make brands impossible to ignore.`
- Body → `We are a creative studio for the AI era. We pair human taste with machine speed — strategy, generative tools, and storytelling under one roof — to ship work that feels alive, not generated.`
- Link `More about us` → unchanged

### Selected work (02)
- Card 1: `Common Ground` / `Brand identity / Digital` → `Mirror Muse` / `AI brand system / Generative`
- Card 2: `Good for Nothing` / `Campaign / Culture` → `Ghost Writer` / `AI campaign / Culture`
- Card 3: `Move Your Mind` / `Strategy / Experience` → `Dream Rotary` / `AI film / Experience`

### Circular gallery (`galleryItems`)
- `Common Ground` → `Mirror Muse`
- `Good for Nothing` → `Ghost Writer`
- `Move Your Mind` → `Dream Rotary`
- `Assembly` → `Latent Assembly`
- `North Star` → `North Signal`
- `Bright Flag` → `Bright Model`

### Services (03)
- H2 `Good work starts with a good question.` → `Good prompts start with a good question.`
- Section label `03 / What we do` → unchanged
- 01 `Brand strategy` → `AI brand systems` — body: `Strategy first. We define the sharp idea behind your brand, then build an AI-powered system that keeps it consistent everywhere.`
- 02 `Visual identity` → `Generative identity` — body: `A living visual language — trained, tuned, and art-directed so every output feels unmistakably yours.`
- 03 `Digital experiences` → `Websites & AI products` — body: `Sites and products that pair human craft with intelligent systems, from first scroll to final prompt.`
- 04 `Campaigns & content` → `AI campaigns & film` — body: `Bold concepts, generated at the speed of culture. Content, motion, and film your audience will actually talk about.`

### Quote section
- Eyebrow `A few nice words` → unchanged
- Quote 1: `“They understood the ambition immediately and made the whole thing feel easy. The work is bold, useful, and completely us.”` → `“Anti Framer shipped in two weeks what our internal team had been blocked on for a year. It feels human, not generated.”` — Maya Chen, Founder, Latent Assembly
- Quote 2: `“Anti Framer are the rare creative partner who can zoom out to the big idea and still obsess over the smallest detail.”` → `“The rare studio that treats AI as a collaborator, not a shortcut. Every frame, every word still has taste.”` — David Okafor, Brand Director, Ghost Writer
- Quote 3: `“The result did more than look good. It changed how our team talks about the brand, and how our customers see it.”` → `“They didn't just give us an AI campaign. They changed how our whole team thinks about what's possible.”` — Sofia Williams, CEO, Mirror Muse

### Numbers (04)
- `Brands launched` → `AI brands launched`
- `Countries reached` → unchanged
- `Curiosity levels` (∞) → unchanged

### FAQ (05)
- Q1 `What does Anti Framer do?` → A: `We are an independent AI creative studio for ambitious brands. Strategy, generative design, film, and intelligent products — under one roof.`
- Q2 `How do you work with clients?` → A: `As a small senior team working alongside a tuned set of AI tools. Fast thinking, fast generation, slow craft on the parts that matter. No layers between the idea and the work.`
- Q3 `Where are you based?` → A: unchanged
- Q4 `Can we work together?` → A: `Probably. Tell us what you're building — human, machine, or both — and we'll get back to you with a point of view.`
- H2 `Questions, answered.` → unchanged

### CTA
- Eyebrow `Have a good idea?` → unchanged
- H2 `Let's make / something / matter.` → unchanged
- Email: keep `hello@antiframer.studio`
- Bottom meta `Available for 2025` → unchanged

### Footer / misc
- Cart drawer `Shop / Nothing here yet.` → `Shop / Nothing here / yet.` (unchanged) but body: `We are training something worth taking home.`
- Mobile menu tagline `Available for a good idea.` → `Available for a good prompt.`
- Footer copyright `© 2025 Anti Framer. All rights reserved.` → unchanged

### Metadata (`app/layout.tsx`)
- Title: `Anti Framer — Ideas that move people` → `Anti Framer — AI Creative Studio`
- Description: `Anti Framer is an independent creative studio for brands with a point of view.` → `Anti Framer is an independent AI creative studio. Strategy, generative design, and intelligent products for ambitious brands.`

## Out of scope

- Visual reskin, palette changes, new components, image swaps.
- Functional changes to cart drawer, gallery, menu.
- Footer link URLs, email address.

## Verification

1. `pnpm dev` locally, view home.
2. Confirm hero, services, FAQ, quotes, numbers, CTA, gallery, and cart drawer all render new copy with no console errors.
3. Confirm metadata title in the browser tab reflects the new positioning.
