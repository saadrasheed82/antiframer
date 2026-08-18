# Anti Framer — Site

## Blog

In-house blog backed by Supabase, exposed through three surfaces:

- **Public pages** at `/blog`, `/blog/[slug]`, `/blog/tag/[tag]`, `/blog/rss.xml`, `/sitemap.xml`
- **Admin UI** at `/admin/blog` (Supabase Auth, server actions)
- **Public JSON API** at `/api/posts` and `/api/posts/[slug]` for programmatic publishing from CI, Claude agents, or external tooling

### One-time setup (SUPABASE_SERVICE_ROLE_KEY still pending)

The blog won't run until you fill in `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Right now it's a placeholder:

```
SUPABASE_SERVICE_ROLE_KEY=PENDING_DASHBOARD_LOOKUP
```

`BLOG_API_KEY` was already generated for you and lives in `.env.local` (a 64-char hex string). Use it as the `Authorization: Bearer <value>` for every POST/PATCH/DELETE below. If you rotate it, update `.env.local` and any external callers together.

Where to get the missing key:

1. **`SUPABASE_SERVICE_ROLE_KEY`** — open the Supabase Dashboard → your project → **Project Settings → API keys → "service_role" secret**. This bypasses RLS, so it must stay server-only (it is already only referenced from server components / route handlers).
2. While you're in the dashboard, make sure the `posts`, `tags`, `post_tags` tables exist (migrations in Task 2 of this worktree) and that a Supabase Auth user exists for admin login — create one from **Authentication → Users → Add user** if you haven't yet. Then grant admin: `insert into public.profiles (id, is_admin) values ('<user-uuid>', true) on conflict (id) do update set is_admin = true;`

Until the placeholder is replaced, `pnpm build` will still succeed (the RSS feed, sitemap, and blog list are `force-dynamic`), but the site will return errors at request time.

### Public REST API

All endpoints require `Authorization: Bearer $BLOG_API_KEY`.

#### Create a post

```bash
curl -X POST https://your-domain.com/api/posts \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello from the API",
    "content_md": "# Hello\n\nThis is **markdown**.",
    "excerpt": "Optional short summary (max 300 chars)",
    "status": "draft",
    "tags": ["ai-tools", "behind-the-scenes"],
    "cover_image_url": "https://example.com/cover.jpg",
    "published_at": "2026-08-17T12:00:00Z"
  }'
```

`slug` is optional and auto-derived from `title` if omitted. `status` defaults to `draft`, so new posts do NOT appear on `/blog` until you promote them. Returns `201 { id, slug }`.

#### Update a post (partial)

```bash
curl -X PATCH https://your-domain.com/api/posts/hello-from-the-api \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "published", "published_at": "2026-08-17T16:00:00Z" }'
```

#### Archive (soft-delete)

```bash
curl -X DELETE https://your-domain.com/api/posts/hello-from-the-api \
  -H "Authorization: Bearer $BLOG_API_KEY"
```

Archived posts 404 on the public site and disappear from `/blog`, the RSS feed, and the sitemap. They remain in the database (`status='archived'`).

#### Admin UI

Visit **`/admin/login`** to sign in with your Supabase Auth email/password, then go to **`/admin/blog`** to manage posts. You can:

- Create a new draft (`/admin/blog/new`)
- Edit title, excerpt, markdown body, cover image, tags
- Toggle `status` between **draft → published → archived**
- See per-post view/edit links. Archive happens through the edit page action button.

### Draft → published workflow

A post is invisible to the public site until ALL of the following are true:

1. `status` is `'published'`
2. `published_at` is set (defaults to `now()` if you publish without one — the admin form handles this for you)

Either flip the status in `/admin/blog/[id]/edit`, or PATCH it via the API as shown above.

### Schema cheat-sheet

| Field | Notes |
|---|---|
| `title` | required, 1-200 chars |
| `slug` | optional; kebab-case; auto-derived from title if absent |
| `excerpt` | optional, max 300 chars |
| `content_md` | required, GitHub-flavored markdown |
| `cover_image_url` | optional; must start with `https://` |
| `tags` | array of kebab-case tag slugs, max 10; tags are auto-created on first use |
| `status` | `'draft' \| 'published' \| 'archived'` (`archived` only via PATCH/DELETE) |
| `published_at` | ISO-8601 datetime with offset (e.g. `2026-08-17T16:00:00Z`) |
| `author_name` | optional; defaults to `Saad Rasheed` |

### SEO

- `/sitemap.xml` includes the blog index, every published post, and every tag page
- `/blog/rss.xml` is a full-content RSS feed with `content:encoded`
- Each post page renders `BlogPosting` JSON-LD, canonical URLs, and OpenGraph/Twitter cards
