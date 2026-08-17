'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { postInputSchema, postUpdateSchema } from '@/lib/blog/validation'
import { createPost, updatePost, archivePost, SlugConflictError } from '@/lib/blog/posts'
import type { PostWithTags } from '@/lib/blog/types'

type SaveResult = { error: string } | undefined

export async function savePostAction(_prev: unknown, formData: FormData): Promise<SaveResult> {
  const existingSlug = String(formData.get('existing_slug') ?? '') || undefined

  const input = postInputSchema.parse({
    title: formData.get('title'),
    slug: (formData.get('slug') as string) || undefined,
    excerpt: (formData.get('excerpt') as string) || undefined,
    content_md: formData.get('content_md'),
    cover_image_url: (formData.get('cover_image_url') as string) || undefined,
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean),
    status: (formData.get('status') as 'draft' | 'published') ?? 'draft',
  })

  let post: PostWithTags | null
  try {
    post = existingSlug
      ? await updatePost(existingSlug, postUpdateSchema.parse(input))
      : await createPost(input)
  } catch (err) {
    if (err instanceof SlugConflictError) return { error: err.message }
    if (err && typeof err === 'object' && 'issues' in err) return { error: 'Invalid input — check all fields' }
    throw err
  }

  if (!post) return { error: 'Post not found' }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  revalidatePath('/sitemap.xml')
  revalidatePath('/blog/rss.xml')
  for (const t of post.tags) revalidatePath(`/blog/tag/${t.slug}`)

  redirect(`/admin/blog/${post.slug}/edit?saved=1`)
}

export async function archivePostAction(slug: string) {
  await archivePost(slug)
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/sitemap.xml')
  revalidatePath('/blog/rss.xml')
}

export async function publishPostAction(slug: string) {
  await updatePost(slug, { status: 'published' })
  const { getBySlug } = await import('@/lib/blog/posts')
  const post = await getBySlug(slug)
  if (post) {
    revalidatePath('/admin/blog')
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    revalidatePath('/sitemap.xml')
    revalidatePath('/blog/rss.xml')
    for (const t of post.tags) revalidatePath(`/blog/tag/${t.slug}`)
  }
  return { ok: true }
}
