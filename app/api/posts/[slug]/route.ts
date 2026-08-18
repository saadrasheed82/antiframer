import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiKey, handleZodError, handleUnknownError, apiError } from '@/lib/blog/api'
import { postUpdateSchema } from '@/lib/blog/validation'
import { getBySlug, updatePost, archivePost, SlugConflictError } from '@/lib/blog/posts'
import { ZodError } from 'zod'

interface Ctx {
  params: Promise<{ slug: string }>
}

function revalidatePost(slug: string, tags: Array<{ slug: string }>) {
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/sitemap.xml')
  revalidatePath('/blog/rss.xml')
  for (const t of tags) revalidatePath(`/blog/tag/${t.slug}`)
}

export async function GET(_request: Request, ctx: Ctx) {
  const unauth = requireApiKey(_request)
  if (unauth) return unauth

  try {
    const { slug } = await ctx.params
    const post = await getBySlug(slug)
    if (!post) return apiError('not_found', `post not found: ${slug}`, 404)
    return NextResponse.json(post)
  } catch (err) {
    return handleUnknownError('GET /api/posts/[slug]', err)
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const unauth = requireApiKey(request)
  if (unauth) return unauth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('invalid_body', 'request body must be JSON', 400)
  }

  try {
    const { slug } = await ctx.params
    const patch = postUpdateSchema.parse(body)
    const updated = await updatePost(slug, patch)
    if (!updated) return apiError('not_found', `post not found: ${slug}`, 404)

    revalidatePost(updated.slug, updated.tags)
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err)
    if (err instanceof SlugConflictError) return apiError('slug_conflict', err.message, 409)
    return handleUnknownError('PATCH /api/posts/[slug]', err)
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const unauth = requireApiKey(request)
  if (unauth) return unauth

  try {
    const { slug } = await ctx.params
    const ok = await archivePost(slug)
    if (!ok) return apiError('not_found', `post not found: ${slug}`, 404)
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    revalidatePath('/sitemap.xml')
    revalidatePath('/blog/rss.xml')
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleUnknownError('DELETE /api/posts/[slug]', err)
  }
}
