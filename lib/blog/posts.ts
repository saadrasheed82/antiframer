import { createServiceClient } from '../supabase/server'
import type { Post, PostWithTags, Tag, PostStatus } from './types'
import { deriveSlug, computeReadingMinutes, type PostInput, type PostUpdate } from './validation'

export class SlugConflictError extends Error {
  constructor(slug: string) {
    super(`Slug already in use: ${slug}`)
    this.name = 'SlugConflictError'
  }
}

const POST_SELECT = `
  id, slug, title, excerpt, content_md, cover_image_url, status, author_name,
  published_at, reading_minutes, created_at, updated_at,
  post_tags ( tag:tags ( id, slug, name ) )
`

type RawRow = Omit<Post, 'id'> & {
  id: string
  post_tags: Array<{ tag: Tag | null }> | null
}

function toPostWithTags(row: RawRow): PostWithTags {
  const tags = (row.post_tags ?? [])
    .map(pt => pt.tag)
    .filter((t): t is Tag => !!t)
  const { post_tags, ...rest } = row
  void post_tags
  return { ...(rest as Post), tags }
}

// Exposed for unit tests only.
export const __test = { toPostWithTags }

async function upsertTags(supabase: ReturnType<typeof createServiceClient>, slugs: string[]): Promise<Tag[]> {
  if (slugs.length === 0) return []
  const rows = slugs.map(slug => ({ slug, name: slug.replace(/-/g, ' ') }))
  const { data, error } = await supabase
    .from('tags')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: false })
    .select()
  if (error) throw new Error(`upsertTags: ${error.message}`)
  return data as Tag[]
}

async function replacePostTags(supabase: ReturnType<typeof createServiceClient>, postId: string, tagIds: string[]) {
  await supabase.from('post_tags').delete().eq('post_id', postId)
  if (tagIds.length === 0) return
  const rows = tagIds.map(tag_id => ({ post_id: postId, tag_id }))
  const { error } = await supabase.from('post_tags').insert(rows)
  if (error) throw new Error(`replacePostTags: ${error.message}`)
}

export async function createPost(input: PostInput): Promise<PostWithTags> {
  const supabase = createServiceClient()
  const slug = input.slug || deriveSlug(input.title)
  if (!slug) throw new Error('invalid_body: could not derive slug from title')

  const insert = {
    slug,
    title: input.title,
    excerpt: input.excerpt ?? null,
    content_md: input.content_md,
    cover_image_url: input.cover_image_url || null,
    status: input.status ?? 'draft',
    author_name: input.author_name ?? 'Saad Rasheed',
    published_at: input.published_at ?? null,
    reading_minutes: computeReadingMinutes(input.content_md),
  }
  const { data, error } = await supabase.from('posts').insert(insert).select(POST_SELECT).single()
  if (error) {
    if (error.code === '23505') throw new SlugConflictError(slug)
    throw new Error(`createPost: ${error.message}`)
  }

  const tagSlugs = input.tags ?? []
  const tags = await upsertTags(supabase, tagSlugs)
  await replacePostTags(supabase, data.id, tags.map(t => t.id))

  const final = await getBySlug(slug)
  if (!final) throw new Error('createPost: just-created row not found')
  return final
}

export async function updatePost(slug: string, patch: PostUpdate): Promise<PostWithTags | null> {
  const supabase = createServiceClient()
  const update: Record<string, unknown> = { ...patch }
  delete update.tags

  if (patch.content_md) update.reading_minutes = computeReadingMinutes(patch.content_md)

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from('posts').update(update).eq('slug', slug)
    if (error) {
      if (error.code === '23505') throw new SlugConflictError(String(patch.slug ?? slug))
      if (error.code === 'PGRST116') return null
      throw new Error(`updatePost: ${error.message}`)
    }
  }

  if (patch.tags) {
    const existing = await getBySlug(slug)
    if (!existing) return null
    const tags = await upsertTags(supabase, patch.tags)
    await replacePostTags(supabase, existing.id, tags.map(t => t.id))
  }

  return getBySlug(patch.slug ?? slug)
}

export async function archivePost(slug: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error, count } = await supabase
    .from('posts')
    .update({ status: 'archived' }, { count: 'exact' })
    .eq('slug', slug)
  if (error) throw new Error(`archivePost: ${error.message}`)
  return (count ?? 0) > 0
}

export async function getBySlug(slug: string): Promise<PostWithTags | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`getBySlug: ${error.message}`)
  return data ? toPostWithTags(data as unknown as RawRow) : null
}

export async function getPublishedBySlug(slug: string): Promise<PostWithTags | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw new Error(`getPublishedBySlug: ${error.message}`)
  return data ? toPostWithTags(data as unknown as RawRow) : null
}

interface ListOpts {
  page?: number
  perPage?: number
  tag?: string
}

export async function listPublished(opts: ListOpts = {}): Promise<{ posts: PostWithTags[]; total: number }> {
  const supabase = createServiceClient()
  const page = Math.max(1, opts.page ?? 1)
  const perPage = Math.max(1, Math.min(50, opts.perPage ?? 12))
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const selectClause = opts.tag
    ? POST_SELECT.replace('post_tags (', 'post_tags!inner (').replace('tag:tags (', 'tag:tags!inner (')
    : POST_SELECT

  let q = supabase
    .from('posts')
    .select(selectClause, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (opts.tag) {
    q = q.eq('post_tags.tag.slug', opts.tag)
  }

  const { data, error, count } = await q
  if (error) throw new Error(`listPublished: ${error.message}`)
  const posts = (data ?? []).map(r => toPostWithTags(r as unknown as RawRow))

  return { posts, total: count ?? 0 }
}

export async function listAll(opts: { status?: PostStatus } = {}): Promise<PostWithTags[]> {
  const supabase = createServiceClient()
  let q = supabase.from('posts').select(POST_SELECT).order('updated_at', { ascending: false })
  if (opts.status) q = q.eq('status', opts.status)
  const { data, error } = await q
  if (error) throw new Error(`listAll: ${error.message}`)
  return (data ?? []).map(r => toPostWithTags(r as unknown as RawRow))
}

export async function listTagsWithCounts(): Promise<Array<Tag & { count: number }>> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('tags')
    .select('id, slug, name, post_tags(post_id, posts!inner(status))')
  if (error) throw new Error(`listTagsWithCounts: ${error.message}`)
  return (data ?? [])
    .map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      count: (row.post_tags ?? []).filter((pt: any) => pt.posts?.status === 'published').length,
    }))
    .filter(t => t.count > 0)
}

export async function listRelated(postId: string, limit = 3): Promise<PostWithTags[]> {
  const supabase = createServiceClient()
  // Get the source post's tags
  const { data: srcTags, error: e1 } = await supabase
    .from('post_tags')
    .select('tag_id')
    .eq('post_id', postId)
  if (e1) throw new Error(`listRelated(src): ${e1.message}`)
  const tagIds = (srcTags ?? []).map(r => r.tag_id)
  if (tagIds.length === 0) return []

  // Posts sharing any of those tags (excluding the source), published only
  const { data: candidates, error: e2 } = await supabase
    .from('post_tags')
    .select('post_id, posts!inner(' + POST_SELECT + ')')
    .in('tag_id', tagIds)
    .neq('post_id', postId)
    .eq('posts.status', 'published')
  if (e2) throw new Error(`listRelated(cands): ${e2.message}`)

  // Rank by overlap count
  const counts = new Map<string, { row: RawRow; score: number }>()
  for (const c of candidates ?? []) {
    const row = (c as any).posts
    if (!row) continue
    const existing = counts.get(row.id)
    if (existing) {
      existing.score += 1
    } else {
      counts.set(row.id, { row, score: 1 })
    }
  }
  return Array.from(counts.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ row }) => toPostWithTags(row))
}
