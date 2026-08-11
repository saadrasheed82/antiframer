# Demo Reel Video Section — Design Spec

**Date:** 2026-08-11
**Status:** Approved by user

## Goal

Add a new section to the home page showcasing 8 public demo videos hosted on Supabase storage. Mixed portrait/landscape orientations arranged in a masonry mosaic that fits the site's Swiss-brutalist editorial style.

## Placement

New `<section>` inserted between **Numbers** (`04 / By the numbers`) and **FAQ**. FAQ's label is renumbered `05 → 06`, new section takes `05 / Demo reel`.

## Behavior

- Videos: `muted autoplay loop playsInline preload="metadata"`.
- Runtime orientation detection: on `loadedmetadata`, read `videoWidth/videoHeight`, set `data-orient="portrait" | "landscape"` on the wrapper — grid span adapts automatically.
- Click a video → toggle sound. Only one video with sound at a time (clicking a second mutes the first). Speaker badge indicates which has sound.
- `IntersectionObserver` pauses videos when off-screen (battery/CPU), resumes on re-entry.
- Reveal-on-scroll uses existing global `data-reveal` system.

## Layout

- 12-column grid, 18px gap (matches `.project-grid`).
- Portrait: `grid-column: span 4`. Landscape: `grid-column: span 8`.
- JavaScript assigns items to rows so each row fills 12: [P+P+L], [L+P], etc. — greedy packing since orientation is knowable after metadata.
  - Simplification chosen at implementation: CSS `grid-auto-flow: dense` with spans; with 4P/4L it tessellates without manual packing.
- Mobile (<800px): single-column stack, natural aspect ratio per video.

## Styling

- Background `#f5f5f5` (light gray) — alternates from lime Numbers into red CTA.
- Video wrapper: 1px border, existing `project-meta`-style caption under each (`GRID / FILM 01`, uppercase 11px letterspaced).
- Section header uses existing `.section-head` / `.section-label` pattern with 2-line intro copy.
- Sound badge: fixed corner pill (speaker icon / "SOUND"), only visible when unmuted.

## Video inventory

| # | File | Assumed orient. | Size |
|---|------|----------------|------|
| 1 | sample4.mp4  | landscape | 4.5MB |
| 2 | sample7.mp4  | portrait  | 38MB |
| 3 | Demo1 (2).mp4 | landscape | 30MB |
| 4 | sample6.mp4  | portrait  | 7MB |
| 5 | sample13.mp4 | landscape | 10MB |
| 6 | sample16.mp4 | portrait  | 7MB |
| 7 | Demo2 (3).mp4 | landscape | 35MB |
| 8 | sample1.mp4  | portrait  | 9MB |

Orientations auto-detected at runtime — table is only for initial packing order.

Base URL: `https://qunmardnapopzywrqonb.supabase.co/storage/v1/object/public/demo%20vides/`

## Files touched

- `app/page.tsx` — add `DemoVideo` subcomponent + data array + new `<section>`; renumber FAQ label to 06.
- `app/globals.css` — ~70 lines: `.demo-reel` section, `.demo-grid`, `.demo-cell` (orient spans), sound badge, mobile overrides.

## Out of scope

- Lightbox / fullscreen player
- Custom controls beyond mute toggle
- Poster frames / captions tracks
