import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiKey, handleZodError, handleUnknownError, apiError } from '@/lib/blog/api'
import { postInputSchema } from '@/lib/blog/validation'
import { createPost, SlugConflictError } from '@/lib/blog/posts'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  const unauth = requireApiKey(request)
  if (unauth) return unauth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError('invalid_body', 'request body must be JSON', 400)
  }

  try {
    const input = postInputSchema.parse(body)
    const post = await createPost(input)

    if (post.status === 'published') {
      revalidatePath('/blog')
      revalidatePath(`/blog/${post.slug}`)
      revalidatePath('/sitemap.xml')
      revalidatePath('/blog/rss.xml')
      for (const t of post.tags) revalidatePath(`/blog/tag/${t.slug}`)
    }

    return NextResponse.json({ id: post.id, slug: post.slug }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err)
    if (err instanceof SlugConflictError) return apiError('slug_conflict', err.message, 409)
    return handleUnknownError('POST /api/posts', err)
  }
}
