# Blog + SEO design — echooks-studio

**Date:** 2026-08-17
**Goal:** Get clients from Google search via a blog on echooks-studio. Blog accepts programmatic + handcrafted posts through an authenticated HTTP endpoint.

## 1. Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Next.js 16 App Router (this repo)                       │
│                                                          │
│  PUBLIC (SEO)              ADMIN          API            │
│  /blog                     /admin/login   /api/posts     │
│  /blog/[slug]              /admin/blog    /api/posts/    │
│  /blog/tag/[tag]           /admin/blog/    [slug]        │
│  /blog/rss.xml                new                       │
│  /sitemap.xml              /admin/blog/                 │
│                               [id]/edit                 │
└──────────────────────────────────────────────────────────┘
            │ server-side only, service-role key
            ▼
┌──────────────────────────────────────────────────────────┐
│  Supabase Postgres                                       │
│  posts · tags · post_tags · profiles (is_admin)          │
└──────────────────────────────────────────────────────────┘
```

- Public routes are React Server Components — Google gets fully rendered HTML.
- API is server-only. The service-role key never ships to the client.
- Public reads use the anon key with Row-Level Security restricting to `status='published'`.
- Admin auth uses Supabase Auth (email/password). A `profiles.is_admin` flag gates admin routes via middleware.

## 2. Data model

```sql
posts
  id              uuid pk default gen_random_uuid()
  slug            text unique not null            -- kebab-case, indexed
  title           text not null
  excerpt         text                            -- used for meta description
  content_md      text not null
  cover_image_url text
  status          text not null default 'draft'   -- draft | published | archived
  author_name     text not null default 'Saad Rasheed'
  published_at    timestamptz
  reading_minutes int
  created_at      timestamptz default now()
  updated_at      timestamptz default now()

tags
  id    uuid pk
  slug  text unique not null
  name  text not null

post_tags
  post_id uuid references posts on delete cascade
  tag_id  uuid references tags on delete cascade
  primary key (post_id, tag_id)

profiles
  id       uuid pk references auth.users on delete cascade
  is_admin boolean not null default false
```

**Rules**
- Slug is lowercase kebab-case enforced by a CHECK constraint (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
- `published_at` set automatically on transition to `published` via trigger (preserves explicit `published_at` if provided).
- `reading_minutes` computed in the API on write: `ceil(word_count / 200)`.
- RLS: `anon` role can `SELECT` only rows where `status='published'`. Service role (used by API + admin server actions) bypasses RLS.
- Indexes: `posts(slug)` unique, `posts(status, published_at desc)`, `tags(slug)` unique, `post_tags(tag_id, post_id)`.

## 3. Public pages (SEO surface)

### `/blog`
- Grid of published posts, newest first.
- Card: cover image, title, excerpt, reading time, tags.
- Pagination via `?page=N`, 12 posts per page.
- Server Component. `revalidatePath` called on post write for immediate freshness; otherwise ISR at 60s.

### `/blog/[slug]`
- Server Component fetches post + tags.
- `<h1>` title, author, date, reading time, tags.
- Markdown rendered with `react-markdown` + `remark-gfm` + `rehype-highlight` (code highlighting for a dev-tools audience).
- Cover image rendered with `next/image`.
- Related posts at bottom (shared tags, max 3, rank by overlap count).
- `generateMetadata` → title, description (excerpt or first 160 chars), canonical URL, Open Graph (title, description, image, type=article), Twitter card.
- JSON-LD `BlogPosting` schema embedded: headline, description, datePublished, dateModified, author, image, mainEntityOfPage.
- Unpublished or missing slugs return real 404 (via `notFound()`), never 200-with-error.

### `/blog/tag/[tag]`
- Lists all published posts sharing the tag. Pagination same as `/blog`.
- Title and H1 include tag name (ranks for "[tag] tutorials / articles").
- Real 404 for unknown tags.

### `/blog/rss.xml`
- Route handler emitting RSS 2.0 of latest 50 published posts.
- `Content-Type: application/rss+xml; charset=utf-8`.
- Submit to Google Search Console after launch.

### `/sitemap.xml`
- Extends existing sitemap to include `/blog`, each `/blog/[slug]`, each `/blog/tag/[tag]`.
- `lastModified` from `posts.updated_at`.

### Look & feel
Match the existing site's dark, editorial aesthetic. Reuse typography and spacing tokens from `app/page.tsx` and `app/globals.css` so `/blog` reads as part of the same site, not a bolt-on.

## 4. HTTP API

Next.js route handlers under `/api/posts`. Auth via `Authorization: Bearer ${BLOG_API_KEY}` env var, single shared secret, compared with constant-time check. 401 otherwise.

### `POST /api/posts`
```json
{
  "title": "useEffect mistakes you're still making",
  "slug": "useeffect-mistakes",            // optional, kebab-cased from title if absent
  "excerpt": "…",
  "content_md": "# Hello\n…",
  "cover_image_url": "https://…",
  "tags": ["react", "hooks"],              // upserted by slug
  "status": "draft" | "published",
  "published_at": "2026-08-17T12:00:00Z"   // optional, defaults to now if published
}
```
- Returns `201 { id, slug }`.
- If `status=published` → `revalidatePath('/blog')`, `revalidatePath('/blog/[slug]')`, `revalidatePath('/sitemap.xml')`, `revalidatePath('/blog/rss.xml')`.

### `PATCH /api/posts/[slug]`
- Updates any subset of fields. Same revalidation rules.
- If status transitions draft→published, sets `published_at=now()` unless explicitly given.

### `DELETE /api/posts/[slug]`
- Soft delete: sets `status='archived'`. Recoverable. Hard delete not exposed via API.
- Revalidates `/blog`, `/blog/[slug]`, `/sitemap.xml`, `/blog/rss.xml` so archived posts drop out everywhere.

### `GET /api/posts/[slug]`
- Returns any post (drafts included), for admin UI use.

### Error envelope
```json
{ "error": { "code": "slug_conflict", "message": "…" } }
```
Codes: `unauthorized` (401), `invalid_body` (400), `not_found` (404), `slug_conflict` (409), `internal` (500).

### Validation
Shared `zod` schema used by API and admin form:
- `title`: 1–200 chars
- `slug`: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 1–100 chars
- `excerpt`: ≤ 300 chars
- `content_md`: non-empty
- `cover_image_url`: valid https URL or empty
- `tags`: array of 0–10 kebab-case strings
- `status`: enum

## 5. Admin UI

- `/admin/login` — email + password via Supabase Auth. Sets session cookie, redirects to `/admin/blog`. Only users with `profiles.is_admin=true` may proceed past login.
- `/admin/blog` — table of all posts regardless of status. Columns: title, status badge, published date, updated date, tag list, actions (edit, archive). Filter buttons: All / Draft / Published / Archived.
- `/admin/blog/new` — split-pane editor:
  - Left: markdown `textarea` with toolbar (bold, italic, h2, h3, link, code, image, list).
  - Right: live preview (same renderer as public page).
  - Top bar: slug input (auto-derived from title, editable), tag chips input, status dropdown (draft/published), Save button, Publish button.
- `/admin/blog/[id]/edit` — same editor pre-filled. Adds Archive button.
- `middleware.ts` guards `/admin/*` except `/admin/login`: no session → redirect to login; session without `is_admin` → 403 page.
- Admin user created once via Supabase dashboard (Auth → Users → invite). Then `profiles.is_admin` flipped to `true` via SQL.

## 6. SEO checklist (deliverables)

- [ ] `generateMetadata` on `/blog`, `/blog/[slug]`, `/blog/tag/[tag]`
- [ ] JSON-LD `BlogPosting` on each post page
- [ ] `sitemap.xml` includes blog URLs
- [ ] `/blog/rss.xml` route handler
- [ ] Canonical URLs on every public page
- [ ] OG + Twitter cards
- [ ] Real 404s for non-published content
- [ ] Heading hierarchy: single `<h1>` per page
- [ ] Internal linking: related posts, tag cross-links

## 7. Errors and edge cases

- Slug collision on POST → 409 with message including conflicting slug.
- Slug auto-derivation trims, lowercases, replaces non-alphanumeric runs with `-`, collapses repeats. If result is empty, returns `invalid_body`.
- `content_md` empty → 400.
- Tag upsert is case-insensitive on slug; display name preserved as given.
- Archived posts return 404 on public routes, but remain accessible via API for restore.
- Middleware session check is cheap (cookie parse); data fetch happens only after auth passes.
- Markdown renderer treats content as untrusted: GFM enabled, raw HTML disabled (`rehype-raw` NOT included). Prevents stored XSS via the API.
- Rate limiting: skip for v1 — single shared secret, low risk. Add later if needed.

## 8. File layout

```
app/
  blog/
    page.tsx                       -- list
    [slug]/page.tsx                -- post
    tag/[tag]/page.tsx             -- tag archive
    rss.xml/route.ts               -- RSS feed
  admin/
    login/page.tsx
    blog/page.tsx                  -- admin list
    blog/new/page.tsx
    blog/[id]/edit/page.tsx
  api/
    posts/route.ts                 -- POST
    posts/[slug]/route.ts          -- GET/PATCH/DELETE
  sitemap.ts                       -- extend existing
lib/
  supabase/
    client.ts                      -- anon client
    server.ts                      -- service-role client (server-only)
    middleware.ts                  -- session refresh
  blog/
    posts.ts                       -- DB read/write
    markdown.ts                    -- renderer
    seo.ts                         -- metadata + JSON-LD builders
    validation.ts                  -- zod schemas
components/
  blog/
    PostCard.tsx
    PostList.tsx
    TagChip.tsx
    RelatedPosts.tsx
    MarkdownRenderer.tsx
  admin/
    PostEditor.tsx
    PostTable.tsx
    TagInput.tsx
middleware.ts                      -- guards /admin/*
```

## 9. Dependencies to add

- `@supabase/supabase-js`, `@supabase/ssr`
- `react-markdown`, `remark-gfm`, `rehype-highlight`, `rehype-slug`, `rehype-autolink-headings`
- `zod`
- `highlight.js` (theme for code)

Explicitly NOT added: `rehype-raw` (XSS risk).

## 10. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only
BLOG_API_KEY                     # server-only, long random string
NEXT_PUBLIC_SITE_URL             # for canonical/OG/sitemap
```

## 11. Testing

- **Schema tests:** none — Postgres constraints are the contract.
- **API tests:** integration tests against the route handler with a test Supabase project (or service-role mock). Cover: 401 without auth, 400 invalid body, 409 slug conflict, 201 happy path, PATCH transitions, DELETE archives.
- **Renderer tests:** snapshot the markdown renderer for a known input covering headings, code, links, images, lists.
- **SEO tests:** unit test `generateMetadata` output for a known post. Unit test JSON-LD shape.
- **E2E smoke:** with the dev server running, `curl` the public routes and confirm 200s, then POST a draft via API with curl and confirm it doesn't appear on `/blog` until status flips to published.

## 12. Out of scope (v1)

- Comments (spam risk, no SEO benefit).
- Multi-author profiles.
- Image upload to Supabase Storage — v1 expects `cover_image_url` to already point at a hosted image (the user can use MeiGen or upload manually via Supabase dashboard).
- Public submission form / guest posts.
- Rate limiting.
- Search.
- i18n.
